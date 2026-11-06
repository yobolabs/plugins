import json, os, sys, tempfile, unittest, datetime as dt
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import ig_intake as ig

FX = os.path.join(os.path.dirname(__file__), "fixtures")
NOON = dt.datetime(2026, 11, 7, 12, 0)


def html(name):
    return open(os.path.join(FX, name)).read()


class T(unittest.TestCase):
    def test_parse_order_and_dedupe(self):
        st, codes = ig.parse(html("ig-collection.html"))
        self.assertEqual(st, "ok")
        self.assertEqual(codes, ["AAAAA11111", "BBBBB22222", "CCCCC33333", "DDDDD44444", "EEEEE55555"])

    def test_max_per_run_keeps_rest_unseen(self):
        state = {"seen": {"AAAAA11111": "x"}}
        res, new = ig.run(html("ig-collection.html"), state, NOON, 3, "8-23")
        self.assertEqual(res["new"], 4)
        self.assertEqual(len(res["queued"]), 3)
        self.assertEqual(res["left"], 1)
        self.assertIn("max_per_run 3", res["limit_hit"])
        self.assertNotIn("EEEEE55555", new["seen"])          # left for the next run, not dropped
        res2, _ = ig.run(html("ig-collection.html"), new, NOON, 3, "8-23")
        self.assertEqual(res2["queued"], [ig.url("EEEEE55555")])

    def test_login_wall_stops(self):
        res, new = ig.run(html("ig-login.html"), {"seen": {}}, NOON, 3, "8-23")
        self.assertEqual(res["status"], "login_wall")
        self.assertEqual(res["queued"], [])

    def test_outside_hours_reads_nothing(self):
        res, _ = ig.run(html("ig-collection.html"), {"seen": {}}, NOON.replace(hour=3), 3, "8-23")
        self.assertEqual(res["status"], "outside_hours")
        self.assertEqual(res["found"], 0)

    def test_main_logs_one_line_and_exit_codes(self):
        d = tempfile.mkdtemp()
        st, lg = os.path.join(d, "seen.json"), os.path.join(d, "run.log")
        base = ["--state", st, "--log", lg, "--now", NOON.isoformat()]
        self.assertEqual(ig.main(["--html", os.path.join(FX, "ig-login.html"), *base]), 3)
        self.assertEqual(ig.main(["--html", os.path.join(FX, "ig-collection.html"), *base]), 0)
        lines = open(lg).read().splitlines()
        self.assertEqual(len(lines), 2)
        self.assertEqual(json.loads(lines[1])["new"], 5)
        self.assertFalse(os.path.exists(st))                 # not queued -> nothing marked seen


if __name__ == "__main__":
    unittest.main()
