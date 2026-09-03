#!/usr/bin/env python3
"""每日游戏营销事件看板 JSON 校验器（写入前必须通过）。

用法:
    python3 validate_gmd.py <dashboard.json>

退出码 0 = 校验通过；1 = 校验失败（打印所有错误）。
纯标准库实现，无第三方依赖，规则与组件包 schema.json 一致。
"""
import json
import re
import sys
from urllib.parse import urlparse

HEAT = {"高", "中", "低"}
PLATFORM = {"微博", "抖音", "小红书"}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def is_uri(v):
    if not isinstance(v, str) or not v:
        return False
    p = urlparse(v)
    return p.scheme in ("http", "https") and bool(p.netloc)


def check(cond, errors, path, msg):
    if not cond:
        errors.append(f"{path}: {msg}")


def validate(data):
    errors = []
    check(isinstance(data, dict), errors, "$", "顶层必须是对象")
    if not isinstance(data, dict):
        return errors

    for key in ("date", "updatedAt", "headline", "items", "trend", "action"):
        check(key in data, errors, "$", f"缺少必需字段 {key}")

    if "date" in data:
        check(isinstance(data["date"], str) and bool(DATE_RE.match(data["date"])),
              errors, "$.date", "必须是 YYYY-MM-DD 格式")
    for key in ("updatedAt", "headline", "trend", "action"):
        if key in data:
            check(isinstance(data[key], str), errors, f"$.{key}", "必须是字符串")

    items = data.get("items")
    check(isinstance(items, list), errors, "$.items", "必须是数组")
    if isinstance(items, list):
        check(len(items) <= 6, errors, "$.items", "最多 6 条事件")
        for i, it in enumerate(items):
            p = f"$.items[{i}]"
            check(isinstance(it, dict), errors, p, "必须是对象")
            if not isinstance(it, dict):
                continue
            for key in ("game", "heat", "event", "source", "hotSearchCheckedAt", "hotSearches"):
                check(key in it, errors, p, f"缺少必需字段 {key}")
            for key in ("game", "event", "hotSearchCheckedAt"):
                if key in it:
                    check(isinstance(it[key], str), errors, f"{p}.{key}", "必须是字符串")
            if "heat" in it:
                check(it["heat"] in HEAT, errors, f"{p}.heat", "必须是 高/中/低 之一")
            if "source" in it:
                check(is_uri(it["source"]), errors, f"{p}.source", "必须是 http(s) URL")
            hs = it.get("hotSearches")
            check(isinstance(hs, list), errors, f"{p}.hotSearches", "必须是数组")
            if isinstance(hs, list):
                for j, h in enumerate(hs):
                    q = f"{p}.hotSearches[{j}]"
                    check(isinstance(h, dict), errors, q, "必须是对象")
                    if not isinstance(h, dict):
                        continue
                    for key in ("platform", "board", "rank", "keyword", "foundAt", "screenshot", "source"):
                        check(key in h, errors, q, f"缺少必需字段 {key}")
                    if "platform" in h:
                        check(h["platform"] in PLATFORM, errors, f"{q}.platform", "必须是 微博/抖音/小红书 之一")
                    for key in ("board", "keyword", "foundAt", "screenshot"):
                        if key in h:
                            check(isinstance(h[key], str), errors, f"{q}.{key}", "必须是字符串")
                    if "rank" in h:
                        check(h["rank"] is None or isinstance(h["rank"], (str, int, float)),
                              errors, f"{q}.rank", "必须是字符串/数字/null")
                    if "source" in h:
                        check(is_uri(h["source"]), errors, f"{q}.source", "必须是 http(s) URL")
                    # 网站侧附加约束：截图必须是公开 HTTPS 地址，禁止本地路径
                    if isinstance(h.get("screenshot"), str) and h["screenshot"]:
                        check(h["screenshot"].startswith("https://"),
                              errors, f"{q}.screenshot",
                              "截图必须是公开 https:// 地址（上传至 data/hot-search-screenshots/ 后取公开 URL）")
    return errors


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.load(f)
    errors = validate(data)
    if errors:
        print(f"校验失败，共 {len(errors)} 处问题：")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    print("校验通过 ✓")
    sys.exit(0)


if __name__ == "__main__":
    main()
