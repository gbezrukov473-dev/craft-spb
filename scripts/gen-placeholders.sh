#!/usr/bin/env bash
# Regenerates the stand-in rasters for shots the shop has not delivered yet.
# Every other image under public/assets/images is real photography — do not
# overwrite it from here.
set -e
FONT="C\:/Windows/Fonts/arial.ttf"
FONTB="C\:/Windows/Fonts/arialbd.ttf"
OUT="D:/Craft/public/assets/images"
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
  " -frames:v 1 -q:v 4 "${OUT}/${name}.jpg"
}

# Work triptych — three portraits sharing one gallery row, so they must share
# one aspect ratio. 3:4 is what the 2x2 desktop cell resolves to.
gen "work-2" 1200 1600 "ПРИМЕР РАБОТЫ 2" "PLACEHOLDER 1200x1600 (3\:4)"
gen "work-3" 1200 1600 "ПРИМЕР РАБОТЫ 3" "PLACEHOLDER 1200x1600 (3\:4)"
gen "work-4" 1200 1600 "ПРИМЕР РАБОТЫ 4" "PLACEHOLDER 1200x1600 (3\:4)"

echo "done"
