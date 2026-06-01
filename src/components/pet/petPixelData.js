// 像素风猫咪 16×16 色彩数据
// '.' = 透明

const O = '#D4A574'   // egg outline
const E = '#FFF5E1'   // egg fill
const H = '#FF6B8A'   // heart
const W = '#87CEEB'   // sweat drop

const B = '#FFB347'   // cat body (orange)
const S = '#E8922D'   // stripes
const K = '#333333'   // eyes
const L = '#FFFFFF'   // eye highlight
const P = '#FFB5B5'   // inner ear / blush
const N = '#FFA07A'   // nose
const M = '#E8922D'   // mouth outline

const G = '#FFD700'   // gold (legendary)
const R = '#FF0000'   // crown jewel
const T = '#B8D4FF'   // wing tips
const Y = '#FFFF00'   // sparkles

const _ = '.'

export const stageNames = ['蛋', '小奶猫', '少年猫', '成年猫', '传说猫']

// ============================================================
// Stage 0 — 蛋
// ============================================================
const egg_normal = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,O,O,O,O,O,O,_,_,_,_,_],
  [_,_,_,_,O,E,E,E,E,E,E,O,_,_,_,_],
  [_,_,_,O,E,E,E,E,E,E,E,E,O,_,_,_],
  [_,_,_,O,E,E,O,E,E,E,E,E,O,_,_,_],
  [_,_,O,E,E,E,E,O,E,E,E,E,E,O,_,_],
  [_,_,O,E,E,E,E,E,E,E,E,E,E,O,_,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,_,O,E,E,E,E,E,E,E,E,E,E,O,_,_],
  [_,_,_,O,E,E,E,E,E,E,E,E,O,_,_,_],
  [_,_,_,_,O,O,O,O,O,O,O,O,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

const egg_happy = [
  [_,_,_,_,_,_,H,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,O,O,O,O,O,O,_,_,_,_,_],
  [_,_,_,_,O,E,E,E,E,E,E,O,_,_,_,_],
  [_,_,_,O,E,E,E,E,E,E,E,E,O,_,_,_],
  [_,_,O,E,E,E,E,E,E,E,E,E,E,O,_,_],
  [_,_,O,E,E,E,E,E,E,E,E,E,E,O,_,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,_,O,E,E,E,E,E,E,E,E,E,E,O,_,_],
  [_,_,_,O,E,E,E,E,E,E,E,E,O,_,_,_],
  [_,_,_,_,O,O,O,O,O,O,O,O,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

const egg_sad = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,O,O,O,O,O,O,_,_,W,_,_],
  [_,_,_,_,O,E,E,E,E,E,E,O,_,_,_,_],
  [_,_,_,O,E,E,E,E,E,E,E,E,O,_,_,_],
  [_,_,_,O,E,E,O,E,E,E,E,E,O,_,_,_],
  [_,_,O,E,E,E,E,O,E,E,E,E,E,O,_,_],
  [_,_,O,E,E,E,E,E,E,E,E,E,E,O,_,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,O,E,E,E,E,E,E,E,E,E,E,E,E,O,_],
  [_,_,O,E,E,E,E,E,E,E,E,E,E,O,_,_],
  [_,_,_,O,E,E,E,E,E,E,E,E,O,_,_,_],
  [_,_,_,_,O,O,O,O,O,O,O,O,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

// ============================================================
// Stage 1 — 小奶猫
// ============================================================
const kitten_normal = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,B,_,_,_,_,B,_,_,_,_,_],
  [_,_,_,_,B,P,B,_,_,B,P,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,B,B,K,L,B,B,K,L,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,N,N,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,B,B,B,_,_,_,_,_],
  [_,_,_,_,B,S,B,B,B,B,S,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,B,B,B,_,_,_,_,_],
  [_,_,_,_,_,_,B,B,B,B,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

const kitten_happy = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,B,_,_,_,_,B,_,_,_,_,_],
  [_,_,_,_,B,P,B,_,_,B,P,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,B,B,B,K,B,B,K,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,B,B,P,B,B,B,B,P,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,B,B,B,_,_,_,_,_],
  [_,_,_,_,B,S,B,B,B,B,S,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,B,B,B,_,_,_,_,_],
  [_,_,_,_,_,_,B,B,B,B,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

const kitten_sad = [
  [_,_,_,_,_,B,_,_,_,_,B,_,_,_,_,_],
  [_,_,_,B,B,P,B,_,_,B,P,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,B,B,L,K,B,B,L,K,B,B,_,_,_],
  [_,_,_,B,B,K,_,B,B,K,_,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,M,M,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,B,B,B,_,_,_,_,_],
  [_,_,_,_,B,S,B,B,B,B,S,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,B,B,B,_,_,_,_,_],
  [_,_,_,_,_,_,B,B,B,B,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
]

// ============================================================
// Stage 2 — 少年猫
// ============================================================
const young_normal = [
  [_,_,_,_,_,B,_,_,_,_,_,B,_,_,_,_],
  [_,_,_,_,B,P,B,_,_,_,B,P,B,_,_,_],
  [_,_,_,B,B,B,B,_,_,B,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,B,B,S,B,B,B,B,B,B,S,B,B,_,_],
  [_,_,B,B,B,K,L,B,B,K,L,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,N,N,B,B,B,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,B,S,B,B,B,B,B,B,S,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,_,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

const young_happy = [
  [_,_,_,_,_,B,_,_,_,_,_,B,_,_,_,_],
  [_,_,_,_,B,P,B,_,_,_,B,P,B,_,_,_],
  [_,_,_,B,B,B,B,_,_,B,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,B,B,S,B,B,B,B,B,B,S,B,B,_,_],
  [_,_,B,B,B,B,K,B,B,K,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,B,B,P,B,B,B,B,B,B,P,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,B,S,B,B,B,B,B,B,S,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,_,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

const young_sad = [
  [_,_,_,_,_,B,_,_,_,_,_,B,_,_,_,_],
  [_,_,_,B,B,P,B,_,_,_,B,P,B,B,_,_],
  [_,_,B,B,B,B,B,_,_,B,B,B,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,B,B,S,B,B,B,B,B,B,S,B,B,_,_],
  [_,_,B,B,B,L,K,B,B,L,K,B,B,B,_,_],
  [_,_,B,B,B,K,_,B,B,K,_,B,B,B,_,_],
  [_,_,B,B,B,B,B,M,M,B,B,B,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,B,S,B,B,B,B,B,B,S,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,_,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

// ============================================================
// Stage 3 — 成年猫
// ============================================================
const adult_normal = [
  [_,_,_,_,B,_,_,_,_,_,_,_,B,_,_,_],
  [_,_,_,B,P,B,_,_,_,_,_,B,P,B,_,_],
  [_,_,B,B,B,B,_,_,_,_,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,B,B,S,B,B,B,B,B,B,B,B,S,B,B,_],
  [_,B,B,B,B,K,L,B,B,K,L,B,B,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,N,N,B,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,_,B,B,S,B,B,B,B,B,B,S,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,B,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

const adult_happy = [
  [_,_,_,_,B,_,_,_,_,_,_,_,B,_,_,_],
  [_,_,_,B,P,B,_,_,_,_,_,B,P,B,_,_],
  [_,_,B,B,B,B,_,_,_,_,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,B,B,S,B,B,B,B,B,B,B,B,S,B,B,_],
  [_,B,B,B,B,B,K,B,B,K,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,P,B,B,B,B,B,B,B,B,P,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,_,B,B,S,B,B,B,B,B,B,S,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,B,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

const adult_sad = [
  [_,_,_,_,B,_,_,_,_,_,_,_,B,_,_,_],
  [_,_,B,B,P,B,_,_,_,_,_,B,P,B,B,_],
  [_,B,B,B,B,B,_,_,_,_,B,B,B,B,B,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,B,B,S,B,B,B,B,B,B,B,B,S,B,B,_],
  [_,B,B,B,B,L,K,B,B,L,K,B,B,B,B,_],
  [_,B,B,B,B,K,_,B,B,K,_,B,B,B,B,_],
  [_,B,B,B,B,B,B,M,M,B,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,_,B,B,S,B,B,B,B,B,B,S,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,B,B,B,B,B,B,B,B,B,B,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,B,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

// ============================================================
// Stage 4 — 传说猫 (crown + wings)
// ============================================================
const legend_normal = [
  [_,_,_,_,_,_,_,G,R,G,_,_,_,_,_,_],
  [_,_,_,_,_,_,G,G,G,G,G,_,_,_,_,_],
  [_,_,_,B,_,G,G,G,G,G,G,_,B,_,_,_],
  [_,_,B,G,B,B,B,B,B,B,B,B,B,G,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,G,B,B,K,L,B,K,L,B,B,G,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,B,B,B,B,N,N,B,B,B,B,B,B,_],
  [T,B,B,B,B,B,B,B,B,B,B,B,B,B,B,T],
  [L,T,B,G,B,B,B,B,B,B,B,B,G,B,T,L],
  [_,L,T,B,B,B,B,B,B,B,B,B,B,T,L,_],
  [_,_,B,B,G,B,B,B,B,B,B,G,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,B,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

const legend_happy = [
  [_,_,_,_,_,_,_,G,R,G,_,_,_,_,_,_],
  [_,_,_,_,Y,_,G,G,G,G,G,_,Y,_,_,_],
  [_,_,_,B,_,G,G,G,G,G,G,_,B,_,_,_],
  [_,_,B,G,B,B,B,B,B,B,B,B,B,G,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,G,B,B,B,K,B,K,B,B,G,B,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,P,B,B,B,B,B,B,B,B,P,B,B,_],
  [T,B,B,B,B,B,B,B,B,B,B,B,B,B,B,T],
  [L,T,B,G,B,B,B,B,B,B,B,B,G,B,T,L],
  [_,L,T,B,B,B,B,B,B,B,B,B,B,T,L,_],
  [_,_,B,B,G,B,B,B,B,B,B,G,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,B,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

const legend_sad = [
  [_,_,_,_,_,_,G,R,G,_,_,_,_,_,_,_],
  [_,_,_,_,_,G,G,G,G,G,_,_,_,_,_,_],
  [_,_,B,_,G,G,G,G,G,G,G,G,_,B,_,_],
  [_,B,B,G,B,B,B,B,B,B,B,B,B,G,B,_],
  [_,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_],
  [_,B,B,G,B,B,L,K,B,L,K,B,B,G,B,_],
  [_,B,B,B,B,B,K,_,B,K,_,B,B,B,B,_],
  [_,B,B,B,B,B,B,M,M,B,B,B,B,B,B,_],
  [T,B,B,B,B,B,B,B,B,B,B,B,B,B,B,T],
  [L,T,B,G,B,B,B,B,B,B,B,B,G,B,T,L],
  [_,L,T,B,B,B,B,B,B,B,B,B,B,T,L,_],
  [_,_,B,B,G,B,B,B,B,B,B,G,B,B,_,_],
  [_,_,_,B,B,B,B,B,B,B,B,B,B,_,_,_],
  [_,_,_,_,B,B,B,B,B,B,B,B,_,_,_,_],
  [_,_,_,_,_,B,B,B,_,B,B,B,_,_,_,_],
  [_,_,_,_,_,_,B,_,_,_,_,B,_,_,_,_],
]

export const petPixelData = {
  0: { normal: egg_normal, happy: egg_happy, sad: egg_sad },
  1: { normal: kitten_normal, happy: kitten_happy, sad: kitten_sad },
  2: { normal: young_normal, happy: young_happy, sad: young_sad },
  3: { normal: adult_normal, happy: adult_happy, sad: adult_sad },
  4: { normal: legend_normal, happy: legend_happy, sad: legend_sad }
}
