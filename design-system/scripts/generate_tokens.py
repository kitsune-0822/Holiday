"""design-tokens.json 생성기. 실행: python3 design-system/scripts/generate_tokens.py

Figma variables(DTCG) 형식으로 내보낸다. 이 파일을 고친 뒤 실행하고,
`npm run tokens`로 CSS 변수(src/styles/tokens.css)를 다시 만든다.
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "design-tokens.json"

def hex_to_rgb(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]

def rgb_to_hex(c):
    return "#" + "".join(f"{round(v * 255):02X}" for v in c)

def mix(a, b, t):
    return [x + (y - x) * t for x, y in zip(a, b)]

WHITE = [1, 1, 1]
DARK = hex_to_rgb("#0A1220")
# 500 = 기준색. 낮은 단계는 흰색, 높은 단계는 어두운 남색 쪽으로 섞는다.
STEPS = {50: ("w", .92), 100: ("w", .84), 200: ("w", .68), 300: ("w", .50), 400: ("w", .26),
         500: ("w", 0), 600: ("d", .16), 700: ("d", .32), 800: ("d", .50), 900: ("d", .68)}

def scale(base_hex):
    base = hex_to_rgb(base_hex)
    return {str(k): rgb_to_hex(mix(base, WHITE if to == "w" else DARK, t)) for k, (to, t) in STEPS.items()}

GRAY = {"0": "#FFFFFF", "50": "#F7F8FA", "100": "#EEF0F3", "200": "#DDE1E6", "300": "#C2C8D0",
        "400": "#9AA2AD", "500": "#6B7480", "600": "#565E69", "700": "#3D444D", "800": "#272C33",
        "900": "#16191D", "1000": "#000000"}

palettes = {
    "blue": scale("#0088FF"),
    "gray": GRAY,
    "red": scale("#F03E3E"),
    "green": scale("#12B886"),
    "orange": scale("#FD7E14"),
}

# 투명도가 들어간 색: 오버레이, 그림자, 눌림 상태 레이어용
ALPHA = {
    "black": {"4": .04, "8": .08, "16": .16, "24": .24, "48": .48, "64": .64},
    "white": {"8": .08, "16": .16, "24": .24, "48": .48, "64": .64},
}

def color(hex_, scopes, alpha=1):
    return {
        "$type": "color",
        "$value": {
            "colorSpace": "srgb",
            "components": [round(v, 4) for v in hex_to_rgb(hex_)],
            "alpha": alpha,
            "hex": hex_,
        },
        "$extensions": {"com.figma.scopes": scopes},
    }

def number(v, scopes):
    return {"$type": "number", "$value": v, "$extensions": {"com.figma.scopes": scopes}}

def string(v, scopes):
    return {"$type": "string", "$value": v, "$extensions": {"com.figma.scopes": scopes}}

def alias(t, path, scopes):
    return {"$type": t, "$value": "{" + path + "}", "$extensions": {"com.figma.scopes": scopes}}

def nums(values, key=str):
    # Primitive는 scopes를 비워 피커에 노출하지 않는다. 디자이너는 semantic만 쓰게 한다.
    return {key(v): number(v, []) for v in values}

SPACING = [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128]

primitive = {
    "color": {
        **{name: {k: color(v, []) for k, v in p.items()} for name, p in palettes.items()},
        "alpha": {
            name: {k: color("#000000" if name == "black" else "#FFFFFF", [], a) for k, a in steps.items()}
            for name, steps in ALPHA.items()
        },
    },
    "spacing": nums(SPACING),
    "radius": {**nums([0, 2, 4, 6, 8, 12, 16, 20, 24, 32]), "full": number(9999, [])},
    "border-width": nums([0, 1, 2, 4]),
    "opacity": nums([0, 8, 16, 24, 40, 64, 80, 100]),
    # 레이아웃 고정 치수 (사이드바, 시트 폭 등). 모두 4의 배수.
    "size": nums([44, 88, 120, 160, 200, 300, 480, 800, 960]),
    "z-index": nums([0, 100, 200, 300, 400, 500]),
    # 아래 셋은 Figma에서 쓰이지 않지만 코드와 값을 맞추기 위해 같이 관리한다.
    "duration": nums([150, 250, 400]),
    "easing": {
        "standard": string("cubic-bezier(0.2, 0, 0, 1)", []),
        # iOS 시트가 쓰는 곡선
        "ios": string("cubic-bezier(0.32, 0.72, 0, 1)", []),
    },
    "breakpoint": nums([768, 1280]),
    "font": {
        "family": {
            "sans": string("Pretendard", []),
            "mono": string("JetBrains Mono", []),
        },
        "weight": {
            "regular": number(400, []),
            "medium": number(500, []),
            "semibold": number(600, []),
            "bold": number(700, []),
        },
        "size": nums([11, 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 40, 48]),
        "line-height": nums([14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48, 56]),
        # Figma 변수의 자간 단위는 px. 키에 소수점을 쓰면 참조 경로가 깨져서 이름으로 둔다.
        "letter-spacing": {
            "none": number(0, []),
            "tight-1": number(-0.2, []),
            "tight-2": number(-0.4, []),
            "tight-3": number(-0.6, []),
            "tight-4": number(-1, []),
        },
    },
}

FILL = ["FRAME_FILL", "SHAPE_FILL"]
TEXT = ["TEXT_FILL"]
STROKE = ["STROKE_COLOR"]
ANY_FILL = ["ALL_FILLS", "STROKE_COLOR"]
ICON = ["SHAPE_FILL", "STROKE_COLOR"]
EFFECT = ["EFFECT_COLOR"]
GAP = ["GAP"]

def c(path, scopes):
    return alias("color", "primitive.color." + path, scopes)

def n(path, scopes):
    return alias("number", "primitive." + path, scopes)

def gap(v):
    return n(f"spacing.{v}", GAP)

def size(v):
    return n(f"spacing.{v}", ["WIDTH_HEIGHT"])

def radius(v):
    return n(f"radius.{v}", ["CORNER_RADIUS"])

def stroke(v):
    return n(f"border-width.{v}", ["STROKE_FLOAT"])

def layout(v):
    return n(f"size.{v}", ["WIDTH_HEIGHT"])

def effect(v):
    return n(f"spacing.{v}", ["EFFECT_FLOAT"])

def code_only(path, t="number"):
    # Figma 속성에 바인딩할 일이 없는 값: 피커에 노출하지 않는다.
    return alias(t, "primitive." + path, [])

def text_style(size_, line, weight, tracking="none", family="sans"):
    return {
        "font-family": alias("string", f"primitive.font.family.{family}", ["FONT_FAMILY"]),
        "font-size": n(f"font.size.{size_}", ["FONT_SIZE"]),
        "line-height": n(f"font.line-height.{line}", ["LINE_HEIGHT"]),
        "font-weight": n(f"font.weight.{weight}", ["FONT_WEIGHT"]),
        "letter-spacing": n(f"font.letter-spacing.{tracking}", ["LETTER_SPACING"]),
    }

semantic = {
    "color": {
        "brand": {
            "default": c("blue.500", ANY_FILL),
        },
        "primary": {
            "default": c("blue.500", ANY_FILL),
            "hover": c("blue.600", ANY_FILL),
            "pressed": c("blue.700", ANY_FILL),
            "subtle": c("blue.50", ANY_FILL),
            "subtle-hover": c("blue.100", ANY_FILL),
            "on-primary": c("gray.0", TEXT),
            "on-subtle": c("blue.700", TEXT),
        },
        "text": {
            "primary": c("gray.900", TEXT),
            "secondary": c("gray.600", TEXT),
            "tertiary": c("gray.500", TEXT),
            "placeholder": c("gray.500", TEXT),
            "disabled": c("gray.300", TEXT),
            "inverse": c("gray.0", TEXT),
            "link": c("blue.700", TEXT),
            "danger": c("red.700", TEXT),
            "success": c("green.700", TEXT),
            "warning": c("orange.700", TEXT),
        },
        "icon": {
            "default": c("gray.700", ICON),
            "subtle": c("gray.500", ICON),
            "disabled": c("gray.300", ICON),
            "inverse": c("gray.0", ICON),
            "primary": c("blue.500", ICON),
            "danger": c("red.500", ICON),
            "success": c("green.500", ICON),
            "warning": c("orange.500", ICON),
        },
        "bg": {
            "default": c("gray.0", FILL),
            "subtle": c("gray.50", FILL),
            "muted": c("gray.100", FILL),
            "inverse": c("gray.900", FILL),
            "disabled": c("gray.100", FILL),
            # 선택된 메뉴. 선택+hover는 선택보다 한 단계 진해야 선택 표시가 유지된다.
            "selected": c("gray.100", FILL),
            "selected-hover": c("gray.200", FILL),
            "overlay": c("alpha.black.48", FILL),
            "hover": c("alpha.black.4", FILL),
            "pressed": c("alpha.black.8", FILL),
        },
        "border": {
            "subtle": c("gray.100", STROKE),
            "default": c("gray.200", STROKE),
            "strong": c("gray.300", STROKE),
            "focus": c("blue.500", STROKE),
            "danger": c("red.500", STROKE),
        },
        "status": {
            "danger": c("red.500", ANY_FILL),
            "danger-subtle": c("red.50", ANY_FILL),
            "success": c("green.500", ANY_FILL),
            "success-subtle": c("green.50", ANY_FILL),
            "warning": c("orange.500", ANY_FILL),
            "warning-subtle": c("orange.50", ANY_FILL),
            "info": c("blue.500", ANY_FILL),
            "info-subtle": c("blue.50", ANY_FILL),
        },
        "scrollbar": {
            "thumb": c("alpha.black.24", FILL),
            "thumb-hover": c("alpha.black.48", FILL),
        },
        "shadow": {
            "sm": c("alpha.black.8", EFFECT),
            "md": c("alpha.black.16", EFFECT),
            "lg": c("alpha.black.24", EFFECT),
        },
    },
    # 요소 사이 간격 (auto layout gap)
    "spacing": {
        "none": gap(0), "3xs": gap(4), "2xs": gap(8), "xs": gap(12), "sm": gap(16), "md": gap(20),
        "lg": gap(24), "xl": gap(32), "2xl": gap(40), "3xl": gap(48), "4xl": gap(64),
    },
    # 요소 안쪽 여백 (auto layout padding)
    "padding": {
        "none": gap(0), "xs": gap(4), "sm": gap(8), "md": gap(12), "lg": gap(16), "xl": gap(24), "2xl": gap(32),
        # Figma 컴포넌트에 실제로 쓰인 값에 맞춘다.
        "button": {"x": gap(16), "y-sm": gap(8), "y-md": gap(12), "y-lg": gap(16)},
        "input": {"x": gap(16), "y": gap(16)},
        "nav-item": gap(16),
        "table-cell": {"x": gap(16), "y": gap(8)},
        "badge": {"x": gap(8), "y": gap(4)},
        "card": gap(24),
        "modal": gap(24),
        "page": {"mobile": gap(16), "tablet": gap(24), "desktop": gap(32)},
    },
    "radius": {
        "none": radius(0), "xs": radius(2), "sm": radius(4), "md": radius(8), "lg": radius(12),
        "xl": radius(16), "2xl": radius(24), "3xl": radius(32), "full": radius("full"),
        "button": radius(16), "input": radius(16), "nav-item": radius(16), "card": radius(32),
        "modal": radius(24), "sheet": radius(24), "badge": radius(8), "pill": radius("full"),
        "checkbox": radius(4),
    },
    "border-width": {
        "none": stroke(0), "default": stroke(1), "strong": stroke(2), "focus": stroke(2),
    },
    "size": {
        "icon": {"xs": size(12), "sm": size(16), "md": size(20), "lg": size(24), "xl": size(32)},
        # 버튼·입력 높이: sm 40 / md 48 / lg 56
        "control": {"xs": size(32), "sm": size(40), "md": size(48), "lg": size(56)},
        # 스크롤바 영역 두께. 안쪽 여백(2px)을 빼면 손잡이는 4px.
        "scrollbar": size(8),
        "avatar": {"sm": size(24), "md": size(32), "lg": size(40), "xl": size(56)},
        "count-badge": size(20),
        "dot": {"sm": size(4), "md": size(8)},
        "grabber": {"width": size(40), "height": size(4)},
        "card-min-height": layout(200),
        "textarea-min-height": layout(120),
        "logo": {"sm": size(24), "md": layout(44)},
        "layout": {
            "sidebar-expanded": layout(300),
            "sidebar-collapsed": layout(88),
            "sheet-max-width": layout(800),
            "topbar-height": size(56),
            "table-min-width": layout(960),
            "filter-label": layout(200),
            "filter-label-compact": layout(160),
            "mobile-label": layout(88),
        },
    },
    # 그림자 크기. 색은 color.shadow와 짝을 이룬다.
    "elevation": {
        "sm": {"y": effect(4), "blur": effect(8)},
        "md": {"y": effect(8), "blur": effect(24)},
        "lg": {"y": effect(16), "blur": effect(48)},
    },
    "z-index": {
        "base": code_only("z-index.0"), "sticky": code_only("z-index.100"),
        "drawer": code_only("z-index.200"), "overlay": code_only("z-index.300"),
        "sheet": code_only("z-index.400"), "toast": code_only("z-index.500"),
    },
    "motion": {
        "duration": {
            "fast": code_only("duration.150"), "normal": code_only("duration.250"),
            "slow": code_only("duration.400"),
        },
        "easing": {
            "default": code_only("easing.standard", "string"),
            "sheet": code_only("easing.ios", "string"),
        },
    },
    "breakpoint": {
        "tablet": code_only("breakpoint.768"), "desktop": code_only("breakpoint.1280"),
    },
    "opacity": {
        "disabled": n("opacity.40", ["OPACITY"]),
        # 읽은 알림처럼 한 단계 낮춰 보여줄 때
        "muted": n("opacity.64", ["OPACITY"]),
        "hidden": n("opacity.0", ["OPACITY"]),
        "full": n("opacity.100", ["OPACITY"]),
    },
    "typography": {
        "display": {
            "lg": text_style(48, 56, "bold", "tight-4"),
            "md": text_style(40, 48, "bold", "tight-3"),
        },
        "heading": {
            "xl": text_style(32, 40, "bold", "tight-3"),
            "lg": text_style(28, 36, "bold", "tight-2"),
            "md": text_style(24, 32, "bold", "tight-2"),
            "sm": text_style(20, 28, "bold", "tight-1"),
        },
        "title": {
            "xl": text_style(20, 30, "medium"),
            "lg": text_style(18, 26, "semibold", "tight-1"),
            "md": text_style(16, 24, "semibold"),
            "sm": text_style(14, 20, "semibold"),
        },
        "body": {
            "lg": text_style(16, 24, "regular"),
            "list": text_style(15, 22, "regular"),
            "md": text_style(14, 22, "regular"),
            "sm": text_style(13, 20, "regular"),
        },
        # 요약 카드의 숫자
        "numeric": {
            "lg": text_style(24, 32, "medium", "tight-1"),
        },
        "label": {
            "lg": text_style(16, 24, "medium"),
            "md": text_style(14, 20, "medium"),
            "sm": text_style(12, 16, "medium"),
        },
        "caption": {
            "md": text_style(12, 18, "regular"),
            "sm": text_style(11, 14, "regular"),
        },
        "code": {
            "md": text_style(14, 22, "regular", family="mono"),
            "sm": text_style(12, 18, "regular", family="mono"),
        },
    },
}

doc = {"primitive": primitive, "semantic": semantic, "$extensions": {"com.figma.modeName": "Mode 1"}}
with open(OUT, "w") as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write("\n")

# 검증: 모든 alias가 실제 primitive를 가리키고 타입이 같은지, 텍스트 대비
def resolve(path):
    node = doc
    for k in path.split("."):
        node = node[k]
    return node

def lum(h):
    def ch(v):
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = map(ch, hex_to_rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)

counts = {"alias": 0, "primitive": 0}
def walk(node, prefix):
    for k, v in node.items():
        if k.startswith("$"):
            continue
        if "$type" in v:
            if isinstance(v["$value"], str) and v["$value"].startswith("{"):
                target = resolve(v["$value"].strip("{}"))
                assert target["$type"] == v["$type"], prefix + k
                tv = target["$value"]
                assert not (isinstance(tv, str) and tv.startswith("{")), prefix + k + " 이중 참조"
                counts["alias"] += 1
            else:
                assert prefix.startswith("primitive."), prefix + k + " semantic에 직접 값"
                counts["primitive"] += 1
        else:
            walk(v, prefix + k + ".")
walk(primitive, "primitive.")
walk(semantic, "semantic.")
for v in SPACING:
    assert v % 4 == 0
print(counts)
for name, p in [("text.secondary", "gray.600"), ("text.tertiary", "gray.500"), ("text.placeholder", "gray.500"),
                ("text.link", "blue.700"), ("primary.on-subtle", "blue.700"), ("text.danger", "red.700"),
                ("text.success", "green.700"), ("text.warning", "orange.700"), ("on-primary/blue.500", "blue.500")]:
    hx = resolve("primitive.color." + p)["$value"]["hex"]
    print(f"{name:22} {hx} vs white: {contrast(hx, '#FFFFFF'):.2f}")
