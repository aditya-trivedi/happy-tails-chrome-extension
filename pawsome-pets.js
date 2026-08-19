(function () {
  window.Pawsome = window.Pawsome || {};

  const PALETTE = {
    violet: "#6C4CE0",
    violetDeep: "#43299B",
    mango: "#FFB13D",
    blush: "#FF7A9C",
    cream: "#FFF6EC",
    ink: "#241C3B",
    muted: "#7A7396",
    dogCoat: "#E9A85C",
    dogShadow: "#C7802F",
    dogMuzzle: "#F7D8B4",
    catCoat: "#9AA6C4",
    catShadow: "#7382A6",
    catMuzzle: "#E6ECF7",
    eyeWhite: "#FFF9F2",
    pupil: "#241C3B",
  };

  const P = PALETTE;

  const MOUTH = {
    dog: {
      idle: "M50 38 Q56 42 62 38",
      yawn: "M48 37 Q56 52 64 37",
      chew: "M50 38 Q56 46 62 38",
    },
    cat: {
      idle: "M52 35 Q58 38 64 35",
      yawn: "M50 34 Q58 46 66 34",
      chew: "M52 35 Q58 41 64 35",
    },
  };

  const DOG_SVG = `
    <svg viewBox="0 0 96 67" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="pawsome-stage">
        <g class="pawsome-figure">
          <ellipse class="pawsome-tail" cx="12" cy="40" rx="11" ry="4.5" fill="${P.dogShadow}"/>
          <ellipse class="pawsome-body" cx="44" cy="46" rx="24" ry="15" fill="${P.dogCoat}"/>
          <ellipse cx="34" cy="48" rx="5" ry="4" fill="${P.dogShadow}" opacity="0.45"/>
          <ellipse class="pawsome-leg pawsome-leg-back" cx="32" cy="58" rx="5.5" ry="8" fill="${P.dogShadow}"/>
          <ellipse class="pawsome-leg pawsome-leg-front pawsome-paw-leg" cx="56" cy="58" rx="5.5" ry="8" fill="${P.dogShadow}"/>
          <g class="pawsome-head">
            <g class="pawsome-ear pawsome-ear-left">
              <ellipse cx="40" cy="16" rx="7" ry="11" fill="${P.dogShadow}"/>
              <ellipse cx="41" cy="17" rx="3.2" ry="6" fill="${P.dogMuzzle}"/>
            </g>
            <g class="pawsome-ear pawsome-ear-right">
              <ellipse cx="70" cy="16" rx="7" ry="11" fill="${P.dogShadow}"/>
              <ellipse cx="69" cy="17" rx="3.2" ry="6" fill="${P.dogMuzzle}"/>
            </g>
            <circle cx="56" cy="28" r="15" fill="${P.dogCoat}"/>
            <ellipse cx="56" cy="34" rx="9" ry="6.5" fill="${P.dogMuzzle}"/>
            <circle class="pawsome-eye-white" cx="50" cy="26" r="3.6" fill="${P.eyeWhite}"/>
            <circle class="pawsome-eye-white" cx="62" cy="26" r="3.6" fill="${P.eyeWhite}"/>
            <circle class="pawsome-pupil pawsome-pupil-left" cx="50" cy="26" r="1.7" fill="${P.pupil}"/>
            <circle class="pawsome-pupil pawsome-pupil-right" cx="62" cy="26" r="1.7" fill="${P.pupil}"/>
            <ellipse class="pawsome-eyelid pawsome-eyelid-left" cx="50" cy="26" rx="3.8" ry="3.8" fill="${P.dogCoat}"/>
            <ellipse class="pawsome-eyelid pawsome-eyelid-right" cx="62" cy="26" rx="3.8" ry="3.8" fill="${P.dogCoat}"/>
            <ellipse cx="56" cy="32" rx="3.2" ry="2.2" fill="${P.pupil}"/>
            <path class="pawsome-mouth" d="${MOUTH.dog.idle}" fill="none" stroke="${P.pupil}" stroke-width="1.5" stroke-linecap="round"/>
          </g>
        </g>
      </g>
    </svg>
  `;

  const CAT_SVG = `
    <svg viewBox="0 0 96 67" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="pawsome-stage">
        <g class="pawsome-figure">
          <path class="pawsome-tail" d="M24 45 C12 40 6 26 10 14 C12 6 22 8 20 16"
            fill="none" stroke="${P.catShadow}" stroke-width="5" stroke-linecap="round"/>
          <ellipse class="pawsome-body" cx="46" cy="48" rx="20" ry="13" fill="${P.catCoat}"/>
          <ellipse cx="40" cy="50" rx="4" ry="3.2" fill="${P.catShadow}" opacity="0.4"/>
          <ellipse class="pawsome-leg pawsome-leg-back" cx="34" cy="59" rx="4.5" ry="7" fill="${P.catShadow}"/>
          <ellipse class="pawsome-leg pawsome-leg-front pawsome-paw-leg" cx="56" cy="59" rx="4.5" ry="7" fill="${P.catShadow}"/>
          <g class="pawsome-head">
            <g class="pawsome-ear pawsome-ear-left">
              <path d="M46 22 L49 5 L57 18 Z" fill="${P.catShadow}"/>
              <path d="M48 20 L50.5 9 L55 18 Z" fill="${P.blush}"/>
            </g>
            <g class="pawsome-ear pawsome-ear-right">
              <path d="M59 18 L67 5 L70 22 Z" fill="${P.catShadow}"/>
              <path d="M61 18 L66 9 L68 20 Z" fill="${P.blush}"/>
            </g>
            <circle cx="58" cy="26" r="13" fill="${P.catCoat}"/>
            <ellipse cx="58" cy="32" rx="7.5" ry="5.2" fill="${P.catMuzzle}"/>
            <circle class="pawsome-eye-white" cx="52" cy="24" r="3.2" fill="${P.eyeWhite}"/>
            <circle class="pawsome-eye-white" cx="64" cy="24" r="3.2" fill="${P.eyeWhite}"/>
            <circle class="pawsome-pupil pawsome-pupil-left" cx="52" cy="24" r="1.55" fill="${P.pupil}"/>
            <circle class="pawsome-pupil pawsome-pupil-right" cx="64" cy="24" r="1.55" fill="${P.pupil}"/>
            <ellipse class="pawsome-eyelid pawsome-eyelid-left" cx="52" cy="24" rx="3.4" ry="3.4" fill="${P.catCoat}"/>
            <ellipse class="pawsome-eyelid pawsome-eyelid-right" cx="64" cy="24" rx="3.4" ry="3.4" fill="${P.catCoat}"/>
            <ellipse cx="58" cy="30" rx="2.4" ry="1.6" fill="${P.pupil}"/>
            <path class="pawsome-mouth" d="${MOUTH.cat.idle}" fill="none" stroke="${P.pupil}" stroke-width="1.4" stroke-linecap="round"/>
            <g stroke="${P.pupil}" stroke-width="0.8" stroke-linecap="round" fill="none">
              <line x1="50" y1="32" x2="38" y2="30"/>
              <line x1="50" y1="34" x2="38" y2="36"/>
              <line x1="66" y1="32" x2="78" y2="30"/>
              <line x1="66" y1="34" x2="78" y2="36"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  `;

  Object.assign(window.Pawsome, { PALETTE, MOUTH, DOG_SVG, CAT_SVG });
})();
