"""Snapshot a real (empty) CapCut project into a clean seed fixture for build_ad."""
import argparse, os, sys
import capcut_draft as cd

def capture(project_dir, dest_dir):
    os.makedirs(dest_dir, exist_ok=True)
    info = cd.load_json(os.path.join(project_dir, "draft_info.json"))
    meta = cd.load_json(os.path.join(project_dir, "draft_meta_info.json"))
    info["id"] = "SEED"
    info["name"] = "seed"
    info["duration"] = 0
    info["tracks"] = []
    for k, v in info.get("materials", {}).items():
        if isinstance(v, list):
            info["materials"][k] = []
    for g in meta.get("draft_materials", []):
        if isinstance(g.get("value"), list):
            g["value"] = []
    # strip host-identifying + machine-specific values so the fixture is generic
    info["path"] = ""
    for pkey in ("platform", "last_modified_platform"):
        p = info.get(pkey)
        if isinstance(p, dict):
            for hk in ("device_id", "hard_disk_id", "mac_address"):
                if hk in p:
                    p[hk] = ""
    meta["draft_id"] = "SEED"
    meta["draft_name"] = "seed"
    for pk in ("draft_fold_path", "draft_root_path"):
        if pk in meta:
            meta[pk] = ""
    for tk in ("tm_draft_create", "tm_draft_modified", "tm_draft_removed", "tm_duration"):
        if tk in meta:
            meta[tk] = 0
    cd.save_json(os.path.join(dest_dir, "draft_info.json"), info)
    cd.save_json(os.path.join(dest_dir, "draft_meta_info.json"), meta)

def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("project_dir")
    ap.add_argument("--dest", default=os.path.join(os.path.dirname(__file__), "..", "fixtures", "seed"))
    a = ap.parse_args(argv)
    capture(a.project_dir, a.dest)
    print(a.dest)
    return 0

if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
