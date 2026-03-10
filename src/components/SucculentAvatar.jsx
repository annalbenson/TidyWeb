function succulentIndex(uid) {
    if (!uid) return 0;
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = (hash * 31 + uid.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 6;
}

const SUCCULENTS = [
    // 0 — Echeveria
    ({ size }) => (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#E4F0EB"/>
            <g transform="translate(50,53)">
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(0)"/>
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(45)"/>
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(90)"/>
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(135)"/>
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(180)"/>
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(225)"/>
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(270)"/>
                <ellipse cx="0" cy="-24" rx="9" ry="14" fill="#3D6B58" transform="rotate(315)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(22.5)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(67.5)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(112.5)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(157.5)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(202.5)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(247.5)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(292.5)"/>
                <ellipse cx="0" cy="-16" rx="8" ry="11" fill="#5A8E78" transform="rotate(337.5)"/>
                <ellipse cx="0" cy="-10" rx="6" ry="8" fill="#7DBAAA" transform="rotate(0)"/>
                <ellipse cx="0" cy="-10" rx="6" ry="8" fill="#7DBAAA" transform="rotate(60)"/>
                <ellipse cx="0" cy="-10" rx="6" ry="8" fill="#7DBAAA" transform="rotate(120)"/>
                <ellipse cx="0" cy="-10" rx="6" ry="8" fill="#7DBAAA" transform="rotate(180)"/>
                <ellipse cx="0" cy="-10" rx="6" ry="8" fill="#7DBAAA" transform="rotate(240)"/>
                <ellipse cx="0" cy="-10" rx="6" ry="8" fill="#7DBAAA" transform="rotate(300)"/>
                <circle r="6" fill="#A8D4C6"/>
                <circle r="2.5" fill="#D4EDE6"/>
            </g>
        </svg>
    ),
    // 1 — Barrel Cactus
    ({ size }) => (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#FBF6EE"/>
            <path d="M 34,88 L 36,70 L 64,70 L 66,88 Z" fill="#B86B3A"/>
            <rect x="32" y="65" width="36" height="8" rx="4" fill="#D4864A"/>
            <rect x="32" y="65" width="36" height="4" rx="2" fill="#E09A60"/>
            <ellipse cx="50" cy="50" rx="19" ry="22" fill="#4A7A3A"/>
            <ellipse cx="31" cy="50" rx="4" ry="16" fill="#3D6B30"/>
            <ellipse cx="69" cy="50" rx="4" ry="16" fill="#3D6B30"/>
            <ellipse cx="38" cy="32" rx="4" ry="10" fill="#3D6B30" transform="rotate(30,38,32)"/>
            <ellipse cx="62" cy="32" rx="4" ry="10" fill="#3D6B30" transform="rotate(-30,62,32)"/>
            <ellipse cx="44" cy="36" rx="6" ry="9" fill="#5A9448" opacity="0.6"/>
            <line x1="50" y1="29" x2="50" y2="23" stroke="#F0E8D0" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="50" y1="29" x2="45" y2="24" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="50" y1="29" x2="55" y2="24" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="50" y1="29" x2="43" y2="26" stroke="#F0E8D0" strokeWidth="1" strokeLinecap="round"/>
            <line x1="50" y1="29" x2="57" y2="26" stroke="#F0E8D0" strokeWidth="1" strokeLinecap="round"/>
            <line x1="50" y1="48" x2="50" y2="42" stroke="#F0E8D0" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="50" y1="48" x2="45" y2="43" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="50" y1="48" x2="55" y2="43" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="32" y1="46" x2="26" y2="44" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="32" y1="52" x2="26" y2="52" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="68" y1="46" x2="74" y2="44" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="68" y1="52" x2="74" y2="52" stroke="#F0E8D0" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="50" cy="27" r="4" fill="#E8A0B0"/>
            <circle cx="50" cy="27" r="2" fill="#F5C8D0"/>
        </svg>
    ),
    // 2 — Aloe Vera
    ({ size }) => (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#EAF3EF"/>
            <path d="M 35,90 L 37,72 L 63,72 L 65,90 Z" fill="#B86B3A"/>
            <rect x="33" y="67" width="34" height="8" rx="4" fill="#D4864A"/>
            <rect x="33" y="67" width="34" height="4" rx="2" fill="#E09A60"/>
            <path d="M 50,70 Q 24,58 20,28 Q 28,46 40,66 Z" fill="#3D6B58"/>
            <path d="M 50,70 Q 76,58 80,28 Q 72,46 60,66 Z" fill="#3D6B58"/>
            <path d="M 50,70 Q 30,54 30,22 Q 36,44 44,66 Z" fill="#4E8070"/>
            <path d="M 50,70 Q 70,54 70,22 Q 64,44 56,66 Z" fill="#4E8070"/>
            <path d="M 50,70 Q 36,52 38,18 Q 44,42 50,68 Z" fill="#5F9480"/>
            <path d="M 50,70 Q 64,52 62,18 Q 56,42 50,68 Z" fill="#5F9480"/>
            <path d="M 50,70 Q 44,50 46,14 Q 50,32 54,14 Q 56,50 50,70 Z" fill="#74AAAA"/>
            <circle cx="28" cy="44" r="2" fill="#B8D8CE" opacity="0.8"/>
            <circle cx="25" cy="36" r="1.5" fill="#B8D8CE" opacity="0.7"/>
            <circle cx="23" cy="30" r="1" fill="#B8D8CE" opacity="0.6"/>
            <circle cx="72" cy="44" r="2" fill="#B8D8CE" opacity="0.8"/>
            <circle cx="75" cy="36" r="1.5" fill="#B8D8CE" opacity="0.7"/>
            <circle cx="77" cy="30" r="1" fill="#B8D8CE" opacity="0.6"/>
        </svg>
    ),
    // 3 — Prickly Pear
    ({ size }) => (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#F6F2E8"/>
            <path d="M 36,90 L 38,74 L 62,74 L 64,90 Z" fill="#B86B3A"/>
            <rect x="34" y="69" width="32" height="8" rx="4" fill="#D4864A"/>
            <rect x="34" y="69" width="32" height="4" rx="2" fill="#E09A60"/>
            <ellipse cx="50" cy="66" rx="17" ry="12" fill="#4A7A3A"/>
            <ellipse cx="50" cy="46" rx="13" ry="17" fill="#5A9048"/>
            <ellipse cx="34" cy="44" rx="10" ry="13" fill="#5A9048" transform="rotate(-15,34,44)"/>
            <ellipse cx="46" cy="38" rx="5" ry="8" fill="#72A85A" opacity="0.6"/>
            <circle cx="42" cy="64" r="2.5" fill="#3A6030"/>
            <circle cx="50" cy="60" r="2.5" fill="#3A6030"/>
            <circle cx="58" cy="64" r="2.5" fill="#3A6030"/>
            <line x1="42" y1="64" x2="38" y2="60" stroke="#F0E8C8" strokeWidth="1" strokeLinecap="round"/>
            <line x1="42" y1="64" x2="40" y2="59" stroke="#F0E8C8" strokeWidth="1" strokeLinecap="round"/>
            <line x1="58" y1="64" x2="62" y2="60" stroke="#F0E8C8" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="50" cy="38" r="2.5" fill="#4A7A3A"/>
            <line x1="50" y1="38" x2="50" y2="32" stroke="#F0E8C8" strokeWidth="1" strokeLinecap="round"/>
            <line x1="50" y1="38" x2="46" y2="34" stroke="#F0E8C8" strokeWidth="1" strokeLinecap="round"/>
            <line x1="50" y1="38" x2="54" y2="34" stroke="#F0E8C8" strokeWidth="1" strokeLinecap="round"/>
            <ellipse cx="50" cy="30" rx="5" ry="4" fill="#D46060"/>
            <ellipse cx="50" cy="29" rx="3" ry="2" fill="#E07878" opacity="0.7"/>
        </svg>
    ),
    // 4 — Jade Plant
    ({ size }) => (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#EEF5F0"/>
            <path d="M 34,90 L 36,72 L 64,72 L 66,90 Z" fill="#B86B3A"/>
            <rect x="32" y="67" width="36" height="8" rx="4" fill="#D4864A"/>
            <rect x="32" y="67" width="36" height="4" rx="2" fill="#E09A60"/>
            <rect x="46" y="56" width="8" height="16" rx="3" fill="#9E7A50"/>
            <line x1="50" y1="62" x2="36" y2="52" stroke="#9E7A50" strokeWidth="4" strokeLinecap="round"/>
            <line x1="50" y1="62" x2="64" y2="52" stroke="#9E7A50" strokeWidth="4" strokeLinecap="round"/>
            <line x1="50" y1="57" x2="40" y2="44" stroke="#9E7A50" strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="57" x2="60" y2="44" stroke="#9E7A50" strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="57" x2="50" y2="42" stroke="#9E7A50" strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="32" cy="50" rx="9" ry="7" fill="#3D6B50" transform="rotate(-25,32,50)"/>
            <ellipse cx="68" cy="50" rx="9" ry="7" fill="#3D6B50" transform="rotate(25,68,50)"/>
            <ellipse cx="37" cy="41" rx="9" ry="7" fill="#4E8060" transform="rotate(-35,37,41)"/>
            <ellipse cx="63" cy="41" rx="9" ry="7" fill="#4E8060" transform="rotate(35,63,41)"/>
            <ellipse cx="42" cy="34" rx="9" ry="7" fill="#5A9070" transform="rotate(-20,42,34)"/>
            <ellipse cx="58" cy="34" rx="9" ry="7" fill="#5A9070" transform="rotate(20,58,34)"/>
            <ellipse cx="50" cy="40" rx="9" ry="7" fill="#5A9070"/>
            <ellipse cx="44" cy="27" rx="8" ry="6" fill="#6AA880" transform="rotate(-10,44,27)"/>
            <ellipse cx="56" cy="27" rx="8" ry="6" fill="#6AA880" transform="rotate(10,56,27)"/>
            <ellipse cx="50" cy="23" rx="8" ry="6" fill="#78BAA0"/>
        </svg>
    ),
    // 5 — Haworthia
    ({ size }) => (
        <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#E8F0EC"/>
            <path d="M 28,86 L 32,72 L 68,72 L 72,86 Z" fill="#B86B3A"/>
            <rect x="26" y="67" width="48" height="8" rx="4" fill="#D4864A"/>
            <rect x="26" y="67" width="48" height="4" rx="2" fill="#E09A60"/>
            <path d="M 50,70 Q 26,60 22,34 Q 32,52 44,68 Z" fill="#1E4D38"/>
            <path d="M 50,70 Q 74,60 78,34 Q 68,52 56,68 Z" fill="#1E4D38"/>
            <path d="M 50,70 Q 28,58 28,30 Q 36,50 44,66 Z" fill="#2A6048"/>
            <path d="M 50,70 Q 72,58 72,30 Q 64,50 56,66 Z" fill="#2A6048"/>
            <path d="M 50,70 Q 34,56 36,26 Q 42,46 48,66 Z" fill="#347258"/>
            <path d="M 50,70 Q 66,56 64,26 Q 58,46 52,66 Z" fill="#347258"/>
            <path d="M 50,70 Q 40,54 42,22 Q 47,42 50,68 Z" fill="#408468"/>
            <path d="M 50,70 Q 60,54 58,22 Q 53,42 50,68 Z" fill="#408468"/>
            <path d="M 50,70 Q 44,52 46,18 Q 50,34 54,18 Q 56,52 50,70 Z" fill="#509878"/>
            <line x1="26" y1="50" x2="33" y2="46" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
            <line x1="25" y1="44" x2="31" y2="40" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
            <line x1="24" y1="38" x2="30" y2="34" stroke="white" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
            <line x1="74" y1="50" x2="67" y2="46" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round"/>
            <line x1="75" y1="44" x2="69" y2="40" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round"/>
            <line x1="76" y1="38" x2="70" y2="34" stroke="white" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"/>
            <line x1="43" y1="44" x2="43" y2="34" stroke="white" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
            <line x1="57" y1="44" x2="57" y2="34" stroke="white" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
        </svg>
    ),
];

export default function SucculentAvatar({ uid, size = 40, style, className }) {
    const Plant = SUCCULENTS[succulentIndex(uid)];
    return (
        <span
            style={{ display: 'inline-flex', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, ...style }}
            className={className}
        >
            <Plant size={size} />
        </span>
    );
}
