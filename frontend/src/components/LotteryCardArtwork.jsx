import { useId } from "react";

const SCENES = {
  kerala: ["#ff5870", "#ef2856", "#841c4f", "#431c4a", "#ffe1a0"],
  blue: ["#42d6ff", "#1688d4", "#07569c", "#06376f", "#d7fbff"],
  green: ["#78df70", "#20a957", "#126b4d", "#064337", "#efffba"],
  orange: ["#ffad3f", "#f45a21", "#9b361d", "#582323", "#ffe690"],
  gold: ["#ffe47b", "#f9a81a", "#bd6b10", "#6c3a18", "#fff4bb"],
  pink: ["#ff77bd", "#ec318d", "#a91e70", "#611a5d", "#ffe1f0"],
  teal: ["#54e4d3", "#0da9a5", "#087a85", "#064759", "#c7fff0"],
  magenta: ["#ff75c7", "#e73b9d", "#883b98", "#472862", "#ffdfef"],
  nightblue: ["#4d70ee", "#233bb4", "#152a79", "#0a1749", "#d9edff"],
  akshaya: ["#ff8bd0", "#e833a3", "#9c247c", "#52174e", "#ffe6f5"],
  purple: ["#b374f7", "#7546d8", "#483294", "#241c58", "#f4e4ff"],
};

function Palm({ x, y, scale = 1, color = "#183d3c" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={color}>
      <path d="M-5 0q7-37 5-76l8-2q-1 47 7 78l-9 7z" />
      <path d="M0-76q-27-26-52-17 16 3 29 17-22-9-39 0 24-1 46 11-21-3-34 11 25-11 51-12-17 10-25 27 18-14 31-31 13 17 31 31-8-17-25-27 26 1 51 12-13-14-34-11 22-12 46-11-17-9-39 0 13-14 29-17-25-9-52 17z" />
      <circle cx="-5" cy="-67" r="4" fill="#f5c768" />
      <circle cx="3" cy="-68" r="4" fill="#f5c768" />
    </g>
  );
}

function Pine({ x, y, scale = 1, color = "#142b55" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={color}>
      <path d="M0-106 31-62h-19l31 42H15V0h-30v-20h-28l31-42h-19z" />
      <path d="M-2-8h4v8h-4z" fill="#5b443c" />
    </g>
  );
}

function Leaf({ x, y, rotate = 0, scale = 1, color = "#103f43" }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 0C-10-31 2-70 37-91 44-54 32-17 0 0Z" fill={color} />
      <path d="M1-2 32-79M11-27l17 2M18-45l15 1M4-17l-7-15" fill="none" stroke="rgba(222,255,222,.55)" strokeWidth="2" />
    </g>
  );
}

function Flower({ x, y, scale = 1, petal = "#ffd6ed", center = "#ffd66a" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 6q-1 27-12 48m10-28q12-11 21-8" fill="none" stroke="#284a3d" strokeWidth="3" />
      <g fill={petal} stroke="rgba(255,255,255,.42)" strokeWidth="1.4">
        <ellipse cy="-12" rx="7" ry="13" />
        <ellipse cy="12" rx="7" ry="13" />
        <ellipse cx="-12" rx="13" ry="7" />
        <ellipse cx="12" rx="13" ry="7" />
        <ellipse cx="-9" cy="-9" rx="7" ry="12" transform="rotate(-45 -9 -9)" />
        <ellipse cx="9" cy="9" rx="7" ry="12" transform="rotate(-45 9 9)" />
      </g>
      <circle r="5" fill={center} />
    </g>
  );
}

function Temple() {
  return (
    <g fill="#82461e" stroke="#ffdf83" strokeWidth="2" strokeLinejoin="round">
      <path d="M97 260v-48h17v-23h19v-25h19v-26h17v26h20v25h19v23h18v48z" />
      <path d="M87 260h150v9H87zm20-50h112M126 188h54m-35-25h18m-40 48v68m81-68v68m-56-43h12v16h-12zm31 0h12v16h-12z" fill="none" />
      <path d="m145 138 14-21 14 21m-33 27 19-25 19 25m-39 24 39-25 40 25" />
      <circle cx="159" cy="120" r="4" fill="#fff1b8" />
    </g>
  );
}

function Deer() {
  return (
    <g fill="#241c55" stroke="#f5ddff" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" opacity="0.96">
      <path d="M86 258q16-24 42-21l19 10 15-2 10 7-7 7-14-4-10 8-4 24h-8l-3-20-14 1-10 23h-8l5-26-10-2-7 15h-7l4-18-9 1z" />
      <path d="m150 248 4-17-8-10m9 10 8-14m-16 11-10-10m26 18 8-14m-13 10 13-7" fill="none" strokeWidth="3.6" />
      <path d="M140 240q-4-4-8-2m26 8 8 2" fill="none" stroke="#fff0d4" strokeWidth="2" />
    </g>
  );
}

function SceneDetails({ themeKey }) {
  if (themeKey === "kerala") return (
    <>
      <path d="M0 220q54-45 111-21t98-17 103 20 88-13v171H0z" fill="#942450" opacity=".56" />
      <path d="M0 246q69-25 126-4t115-11 159 7v122H0z" fill="#551d4c" opacity=".55" />
      <path d="M0 282q80-17 155 2t130-2 115 1v79H0z" fill="#252b5b" opacity=".5" />
      <Palm x={28} y={282} scale={1.12} color="#60234f" /><Palm x={363} y={271} scale={.94} color="#63234f" />
      <path d="M277 265v-38l17-17 17 17v38zm-8-39 25-25 25 25m-66 42h76" fill="#71305b" stroke="#f4b2c1" strokeWidth="2" opacity=".7" />
      <path d="M0 300q60-9 119 1t124-1 157 1M0 329q71-8 141 1t125-1 134 0" fill="none" stroke="#ffadc6" strokeWidth="3" opacity=".34" />
      <Palm x={4} y={212} scale={.57} color="#76254f" /><Palm x={397} y={218} scale={.55} color="#76254f" />
    </>
  );
  if (themeKey === "blue") return (
    <>
      <path d="M0 202q51-39 101-12t101-16 98 13 100-14v187H0z" fill="#126da5" opacity=".58" />
      <path d="M0 243q80-27 147-5t121-8 132 3v137H0z" fill="#07538d" opacity=".64" />
      <Palm x={38} y={278} scale={1.04} color="#064c70" /><Palm x={368} y={285} scale={.82} color="#064d70" />
      <path d="M179 257h125l-15 17h-94z" fill="#6d3e36" stroke="#d9c5a2" strokeWidth="2" />
      <path d="M217 252v-54l43 54zm-6 5 15 13h-31z" fill="#f6e9c2" stroke="#fff4da" strokeWidth="2" />
      <path d="M0 286q65-11 130 1t131 0 139 1M0 315q72-11 145 1t125 0 130 0M0 342q64-8 132 1t130 0 138 1" fill="none" stroke="#8ce8f4" strokeWidth="3" opacity=".48" />
      <Palm x={3} y={215} scale={.55} color="#07567b" /><Palm x={398} y={218} scale={.55} color="#07567b" />
    </>
  );
  if (themeKey === "green") return (
    <>
      <path d="M0 239q48-34 92-12t83-7 88 10 137-17v147H0z" fill="#176347" opacity=".72" />
      <path d="M0 283q78-25 142-5t113-5 145 4v93H0z" fill="#0c463f" opacity=".74" />
      <Leaf x={13} y={270} rotate={-20} scale={1.3} color="#08765b" /><Leaf x={76} y={340} rotate={24} scale={1.15} color="#14533c" />
      <Leaf x={329} y={255} rotate={18} scale={1.28} color="#075b4c" /><Leaf x={379} y={339} rotate={-28} scale={1.15} color="#124b3c" />
      <path d="M54 262q37-85 76-143m-61 157q62-91 128-151m92 150q-22-69-65-117m71 120q-54-61-116-81" fill="none" stroke="#d9ffe1" strokeWidth="2" opacity=".32" />
      <Leaf x={5} y={207} rotate={-12} scale={.85} color="#08765b" /><Leaf x={397} y={212} rotate={16} scale={.9} color="#075b4c" />
    </>
  );
  if (themeKey === "orange") return (
    <>
      <circle cx="312" cy="155" r="48" fill="#ffe58a" opacity=".46" />
      <path d="M0 227q52-42 108-17t100-19 95 15 97-20v174H0z" fill="#9c432b" opacity=".64" />
      <path d="M0 268q69-24 139-2t126-8 135 1v101H0z" fill="#642d2d" opacity=".7" />
      <Palm x={31} y={292} scale={1.07} color="#71342f" /><Palm x={374} y={283} scale={.88} color="#6b302c" />
      <path d="M0 307q73-10 146 2t119-1 135 1M0 339q61-8 122 2t144-1 134 1" fill="none" stroke="#ffd37b" strokeWidth="3" opacity=".45" />
      <path d="M261 286q21-27 44-14l19 4 11 12-15 8-15-7-12 12h-7l3-15-16 2-8 12h-7l2-14z" fill="#f6c877" opacity=".5" />
      <Palm x={3} y={216} scale={.53} color="#76332d" /><Palm x={397} y={219} scale={.5} color="#76332d" />
    </>
  );
  if (themeKey === "gold") return (
    <>
      <path d="M0 240q76-34 140-4t126-11 134-8v143H0z" fill="#ae6319" opacity=".54" />
      <path d="M0 286q66-19 132 0t136-3 132 1v76H0z" fill="#643d23" opacity=".62" />
      <Temple />
      <path d="M0 314q78-8 146 2t121-1 133 0M0 341q67-7 131 1t132 0 137 1" fill="none" stroke="#ffe29a" strokeWidth="3" opacity=".46" />
      <circle cx="328" cy="177" r="29" fill="#fff0ac" opacity=".5" />
    </>
  );
  if (themeKey === "pink") return (
    <>
      <path d="M0 244q65-33 123-4t108-21 90 15 79-10v138H0z" fill="#a92878" opacity=".58" />
      <path d="M0 286q80-22 142-2t116-5 142 0v77H0z" fill="#681d66" opacity=".6" />
      <path d="M0 345q72-88 132-178m-51 193q53-117 113-167m151 175q-46-92-97-143" fill="none" stroke="#ffa9d8" strokeWidth="3" opacity=".36" />
      <Flower x={62} y={277} scale={1.1} petal="#ffb6dd" /><Flower x={335} y={326} scale={.9} petal="#f59ad0" />
      <Flower x={301} y={241} scale={.62} petal="#ffe1f2" /><Flower x={36} y={205} scale={.56} petal="#ffb6dd" />
    </>
  );
  if (themeKey === "teal") return (
    <>
      <path d="M0 249q65-36 122-7t101-16 94 20 83-16v132H0z" fill="#087d83" opacity=".58" />
      <path d="M0 291q71-19 145 2t124-4 131 1v72H0z" fill="#064f68" opacity=".62" />
      <Leaf x={20} y={277} rotate={-28} scale={1.22} color="#087b74" /><Leaf x={375} y={271} rotate={24} scale={1.16} color="#076568" />
      <g fill="none" stroke="#a5fff0" opacity=".5">
        <path d="M267 287q-28-40 0-66 28 26 0 66zm0-64q-40-18-44 13 29 12 44-13zm0 0q40-18 44 13-29 12-44-13z" strokeWidth="3" />
        <path d="M267 223v94m-17-69 17 17 17-17" strokeWidth="2" />
      </g>
      <path d="M0 329q65-10 127 1t132 0 141 1" fill="none" stroke="#8cf5e4" strokeWidth="3" opacity=".45" />
    </>
  );
  if (themeKey === "magenta") return (
    <>
      <path d="m0 253 58-70 39 34 53-106 53 85 43-64 51 65 45-42 58 48v159H0z" fill="#744489" opacity=".66" />
      <path d="m0 289 73-42 47 24 61-60 59 47 49-28 48 40 63-28v110H0z" fill="#54285f" opacity=".7" />
      <path d="M25 349q44-93 90-155m211 175q-40-91-88-143" fill="none" stroke="#ffb3df" strokeWidth="3" opacity=".38" />
      <Flower x={61} y={220} scale={.75} petal="#ffbee6" /><Flower x={356} y={234} scale={.74} petal="#ffa4dc" />
      <circle cx="315" cy="153" r="34" fill="#ffe4a0" opacity=".55" />
    </>
  );
  if (themeKey === "nightblue") return (
    <>
      <path d="m0 252 54-74 42 40 59-102 55 84 52-66 52 65 43-44 43 42v163H0z" fill="#203b91" opacity=".72" />
      <path d="m0 294 70-45 46 25 67-61 56 50 53-32 50 44 58-32v119H0z" fill="#101d5c" opacity=".78" />
      <Pine x={40} y={280} scale={.63} color="#10244f" /><Pine x={359} y={282} scale={.74} color="#10214c" />
      <g fill="#e4f2ff" opacity=".82"><circle cx="48" cy="157" r="2"/><circle cx="103" cy="185" r="2.4"/><circle cx="240" cy="142" r="2"/><circle cx="347" cy="196" r="2.3"/><circle cx="292" cy="174" r="1.8" /></g>
      <path d="M0 345q70-8 141 1t123 0 136 0" fill="none" stroke="#729fe8" strokeWidth="3" opacity=".42" />
    </>
  );
  if (themeKey === "akshaya") return (
    <>
      <path d="M0 250q70-33 130-4t103-19 92 17 75-13v131H0z" fill="#b52d85" opacity=".58" />
      <path d="M0 291q77-21 141-1t115-7 144 1v72H0z" fill="#6f226c" opacity=".64" />
      <path d="M17 357q36-88 102-153m-56 168q50-97 118-136m190 132q-33-89-83-142" fill="none" stroke="#ffd0ec" strokeWidth="3" opacity=".45" />
      <Leaf x={24} y={289} rotate={-25} scale={1.08} color="#6e3970" /><Leaf x={370} y={296} rotate={22} scale={1.25} color="#70346d" />
      <Flower x={52} y={226} scale={1.05} petal="#ffc3e5" center="#ffe17e" /><Flower x={347} y={240} scale={1.2} petal="#ffd6ed" center="#ffe17e" />
      <Flower x={26} y={291} scale={0.76} petal="#ffafd9" center="#ffe17e" />
    </>
  );
  return (
    <>
      <path d="m0 251 57-66 39 34 57-99 54 85 52-61 53 66 44-43 44 42v153H0z" fill="#54448e" opacity=".72" />
      <path d="m0 292 68-47 44 28 65-63 60 51 47-30 53 44 63-31v121H0z" fill="#2a285f" opacity=".78" />
      <Pine x={92} y={286} scale={.58} color="#211f54" /><Pine x={308} y={284} scale={.66} color="#211d4d" />
      <g transform="translate(118 8)"><Deer /></g>
      <path d="M0 344q73-13 142 1t128-1 130 1" fill="none" stroke="#d9b2fb" strokeWidth="3" opacity=".4" />
    </>
  );
}

function LotteryCardArtwork({ themeKey }) {
  const sceneId = `lottery-scene-${useId().replaceAll(":", "")}`;
  const colors = SCENES[themeKey] || SCENES.purple;
  const [skyTop, skyBottom, farLand, nearLand, glow] = colors;

  return (
    <svg className="lottery-card-scene" viewBox="80 0 240 364" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${sceneId}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={skyTop} />
          <stop offset=".56" stopColor={skyBottom} />
          <stop offset="1" stopColor={farLand} />
        </linearGradient>
        <radialGradient id={`${sceneId}-sun`} cx="50%" cy="50%" r="50%">
          <stop stopColor={glow} stopOpacity=".72" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${sceneId}-haze`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff" stopOpacity=".2" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#071a43" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill={`url(#${sceneId}-sky)`} />
      <ellipse cx="304" cy="119" rx="118" ry="112" fill={`url(#${sceneId}-sun)`} />
      <path d="M0 196q59-42 114-11t101-13 92 12 93-17v120H0z" fill={farLand} opacity=".42" />
      <SceneDetails themeKey={themeKey} />
      <rect width="400" height="360" fill={`url(#${sceneId}-haze)`} />
      <path d="M0 75q54-13 106 0t102 0 101 0 91-1" fill="none" stroke="#fff" strokeWidth="2" opacity=".12" />
    </svg>
  );
}

export default LotteryCardArtwork;