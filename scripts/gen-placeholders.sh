#!/usr/bin/env bash
set -e
FONT="C\:/Windows/Fonts/arial.ttf"
FONTB="C\:/Windows/Fonts/arialbd.ttf"
OUT="D:/Craft/assets/images"
INK="0x1C1114"
PAPER="0xF3EEE6"

gen() {
  name="$1"; w="$2"; h="$3"; label="$4"; sub="$5"
  fs1=$(( w / 16 )); [ $fs1 -gt 64 ] && fs1=64
  fs2=$(( w / 34 )); [ $fs2 -gt 30 ] && fs2=30
  ffmpeg -y -f lavfi -i "color=c=${PAPER}:s=${w}x${h}" -vf "
    noise=alls=6:allf=t+u,
    drawbox=x=24:y=24:w=iw-48:h=ih-48:color=${INK}@1.0:t=2,
    drawtext=fontfile='${FONTB}':text='${label}':fontcolor=${INK}:fontsize=${fs1}:x=(w-text_w)/2:y=(h-text_h)/2-${fs2},
    drawtext=fontfile='${FONT}':text='${sub}':fontcolor=${INK}@0.7:fontsize=${fs2}:x=(w-text_w)/2:y=(h-text_h)/2+${fs1}
  " -frames:v 1 -q:v 3 "${OUT}/${name}.jpg"
}

gen "hero-main"      1920 1280 "HERO — БАРБЕР ЗА РАБОТОЙ"      "PLACEHOLDER 1920x1280 — заменить на реальное фото"
gen "gallery-1"      1200 1500 "ИНТЕРЬЕР ЗАЛА"                  "PLACEHOLDER 1200x1500"
gen "gallery-2"      1500 1000 "РАБОЧЕЕ МЕСТО МАСТЕРА"          "PLACEHOLDER 1500x1000"
gen "gallery-3"      1000 1000 "ИНСТРУМЕНТЫ"                    "PLACEHOLDER 1000x1000"
gen "gallery-4"      1200 1500 "СТРИЖКА В ПРОЦЕССЕ"             "PLACEHOLDER 1200x1500"
gen "gallery-5"      1500 1000 "ФАСАД, ЛИГОВСКИЙ 71А"           "PLACEHOLDER 1500x1000"
gen "gallery-6"      1000 1300 "ДЕТАЛЬ / ТЕКСТУРА"              "PLACEHOLDER 1000x1300"
gen "why-portrait"   1000 1250 "МАСТЕР CRAFT"                   "PLACEHOLDER 1000x1250"
gen "og-image"       1200 630  "CRAFT — БАРБЕРШОП НА ЛИГОВСКОМ" "PLACEHOLDER OG 1200x630"

echo "done"
