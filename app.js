const POOL = [
  { id: 1, name: "정○○", loc: "지제동 302-21", jimok: "대", area: 1034, amt: 12.4, bank: "농협은행", joined: true },
  { id: 2, name: "김○○", loc: "지제동 365", jimok: "대", area: 704, amt: 8.4, bank: "하나은행", joined: true },
  { id: 3, name: "이○○", loc: "지제동 493", jimok: "답", area: 991, amt: 11.9, bank: "농협은행", joined: true },
  { id: 4, name: "박○○", loc: "지제동 714", jimok: "답", area: 655, amt: 7.8, bank: "하나은행", joined: true },
  { id: 5, name: "최○○", loc: "지제동 772", jimok: "전", area: 1867, amt: 22.4, bank: "저축은행", joined: false },
  { id: 6, name: "강○○", loc: "지제동 877", jimok: "답", area: 833, amt: 10.0, bank: "신한은행", joined: false },
  { id: 7, name: "윤○○", loc: "고덕면 방축리", jimok: "전", area: 1205, amt: 14.5, bank: "-", joined: false },
  { id: 8, name: "장○○", loc: "지제동 823-2", jimok: "대", area: 313, amt: 3.8, bank: "하나은행", joined: false },
];

let state = {
  tab: 0,
  landValue: 1000000000,
  mortgage: 300000000,
  isCorp: false,
  pool: POOL.map((p) => ({ ...p })),
  aggStep: 0,
  animating: false,
  taxType: "현금",
};

const TABS = ["홈", "STO발행", "공동매도", "세금·법률", "자산관리"];
const ICONS = ["⬡", "◈", "◉", "⚖", "◆"];

let toastTimer;

function fmtB(n) {
  return (n / 100000000).toFixed(1);
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.removeAttribute("hidden");
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("is-visible");
    toastTimer = setTimeout(() => el.setAttribute("hidden", ""), 300);
  }, 2800);
}

function render() {
  const s = state;
  const buf = s.landValue * 0.3;
  const issuance = Math.max(0, s.landValue - buf - s.mortgage);
  const joined = s.pool.filter((p) => p.joined);
  const totalBundle = joined.reduce((a, p) => a + p.amt, 0);
  const indivD = 12;
  const bundleD = s.aggStep >= 3 ? 4 : s.aggStep >= 2 ? 7 : indivD;
  const gain = totalBundle * ((indivD - bundleD) / 100);

  const taxBase = (s.landValue * 0.85 - s.landValue * 0.4) / 100000000;
  const taxN = taxBase * 0.45;
  const taxS = s.taxType === "채권" ? taxBase * 0.38 : s.taxType === "대토" ? taxBase * 0.27 : taxN;

  const safeBottom = "calc(14px + env(safe-area-inset-bottom, 0px))";

  document.getElementById("app").innerHTML = `
<div style="position:relative">
  <div style="position:absolute;top:-80px;left:-80px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(14,99,255,0.2) 0%,transparent 70%);pointer-events:none"></div>
  <div style="position:absolute;bottom:-50px;right:-50px;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(232,89,12,0.14) 0%,transparent 70%);pointer-events:none"></div>

  <div style="padding:18px 18px 10px;display:flex;justify-content:space-between;align-items:center;border-bottom:0.5px solid rgba(15,23,42,0.08);background:rgba(30,41,59,0.62)">
    <div>
      <div style="font-size:14px;font-weight:800;letter-spacing:.18em;color:#E8590C">LAND-FI</div>
      <div style="font-size:10px;color:rgba(30,41,59,0.48);margin-top:1px">토지보상 통합 금융 플랫폼</div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <div style="background:rgba(14,99,255,0.14);border:0.5px solid rgba(14,99,255,0.35);border-radius:20px;padding:2px 10px;font-size:9.5px;color:#2563EB;font-weight:700">TESTNET</div>
      <div style="width:30px;height:30px;border-radius:50%;background:#DBEAFE;display:flex;align-items:center;justify-content:center;font-size:12px">👤</div>
    </div>
  </div>

  <div style="display:flex;border-bottom:0.5px solid rgba(15,23,42,0.08);overflow-x:auto;background:rgba(30,41,59,0.55)">
    ${TABS.map(
      (t, i) => `
    <button type="button" onclick="setTab(${i})" style="flex:none;padding:9px 13px;font-size:10px;font-weight:${s.tab === i ? 700 : 400};color:${s.tab === i ? "#E8590C" : "rgba(30,41,59,0.45)"};border:none;background:none;border-bottom:2px solid ${s.tab === i ? "#E8590C" : "transparent"};cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px">
      <span style="font-size:13px">${ICONS[i]}</span>${t}
    </button>`
    ).join("")}
  </div>

  <div style="padding:14px 14px 90px;min-height:520px">
  ${s.tab === 0 ? renderHome() : s.tab === 1 ? renderSTO(issuance, buf) : s.tab === 2 ? renderAgg(joined, totalBundle, indivD, bundleD, gain) : s.tab === 3 ? renderTax(taxBase, taxN, taxS) : renderAsset()}
  </div>

  <div style="position:sticky;bottom:0;background:rgba(255,255,255,0.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:0.5px solid rgba(15,23,42,0.08);box-shadow:0 -4px 24px rgba(15,23,42,0.06);display:flex;padding:7px 0 ${safeBottom}">
    ${TABS.map(
      (t, i) => `
    <button type="button" onclick="setTab(${i})" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;border:none;background:none;cursor:pointer;color:${s.tab === i ? "#E8590C" : "rgba(30,41,59,0.4)"}">
      <span style="font-size:17px">${ICONS[i]}</span>
      <span style="font-size:9px;font-weight:${s.tab === i ? 700 : 400}">${t}</span>
    </button>`
    ).join("")}
  </div>
</div>`;
}

function renderHome() {
  return `
<div style="background:rgba(14,99,255,0.11);border:0.5px solid rgba(14,99,255,0.22);border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:0 1px 3px rgba(15,23,42,0.04)">
  <div style="font-size:10px;font-weight:700;color:#7BAAFF;letter-spacing:.1em;margin-bottom:5px">대한민국 최초</div>
  <div style="font-size:16px;font-weight:800;line-height:1.35;margin-bottom:8px">토지보상 전 과정<br><span style="color:#4DD8C4">원스톱 금융 플랫폼</span></div>
  <div style="font-size:10px;color:rgba(30,41,59,0.55);line-height:1.6">수용 결정 → STO 발행 → 공동매도 → 세금절감 → 재투자</div>
  <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
    ${["법무법인 고구려", "한화투자증권", "ERC-3643"]
      .map((b) => `<span style="background:rgba(14,99,255,0.18);border:0.5px solid rgba(14,99,255,0.35);border-radius:20px;padding:2px 9px;font-size:9px;color:#7BAAFF">${b}</span>`)
      .join("")}
  </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px">
  ${[
    ["9.2조", "LH 연간 최대 보상금", "#7BAAFF"],
    ["323건", "평택지제 STO 가망고객", "#E8590C"],
    ["7%+", "STO 확정 수익률", "#4DD8C4"],
    ["30%", "스마트 컨트랙트 버퍼", "#FFB347"],
  ]
    .map(
      ([v, l, c]) => `
  <div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.09);border-radius:12px;padding:13px;box-shadow:0 1px 4px rgba(15,23,42,0.05)">
    <div style="font-size:22px;font-weight:900;color:${c}">${v}</div>
    <div style="font-size:10px;color:rgba(30,41,59,0.58);margin-top:4px">${l}</div>
  </div>`
    )
    .join("")}
</div>
<div style="font-size:11px;font-weight:700;color:rgba(30,41,59,0.55);letter-spacing:.08em;margin-bottom:10px">서비스 로드맵</div>
${[
  ["Phase 1", "보상 전", "#E8590C", ["① STO 발행 (즉시 유동성)", "② 법률 증액 (고구려)"]],
  ["Phase 2", "보상 시", "#0E63FF", ["③ 보상채권 입고·관리", "④ 공동매도 (역조각투자)", "⑤ AI 세금 시뮬레이션"]],
  ["Phase 3", "보상 후", "#4DD8C4", ["⑥ 보상금 재투자 (한화증권)", "⑦ 커뮤니티 & 지속 관리"]],
]
  .map(
    ([ph, lb, c, items]) => `
<div style="display:flex;gap:10px;margin-bottom:9px">
  <div style="flex-shrink:0;width:58px;text-align:center">
    <div style="background:${c};border-radius:6px;padding:4px 0;font-size:8px;font-weight:700;color:#0F172A">${ph}</div>
    <div style="font-size:8.5px;color:rgba(30,41,59,0.45);margin-top:2px">${lb}</div>
  </div>
  <div style="flex:1;background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.08);border-radius:8px;padding:8px 10px">
    ${items.map((it) => `<div style="font-size:10px;color:rgba(30,41,59,0.68);margin-bottom:3px">${it}</div>`).join("")}
  </div>
</div>`
  )
  .join("")}
`;
}

function renderSTO(issuance, buf) {
  return `
<div style="font-size:11px;font-weight:700;color:rgba(30,41,59,0.5);letter-spacing:.08em;margin-bottom:10px">토큰 발행 시뮬레이션</div>
<div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.09);border-radius:14px;padding:15px;margin-bottom:12px;box-shadow:0 1px 4px rgba(15,23,42,0.05)">
  <div style="font-size:10px;color:rgba(30,41,59,0.5);margin-bottom:5px">예상 보상 가액</div>
  <input type="range" id="lv" min="100000000" max="5000000000" step="100000000" value="${state.landValue}" oninput="updLV(this.value)" style="width:100%;margin:4px 0">
  <div style="text-align:right;font-size:20px;font-weight:900;color:#E8590C">${fmtB(state.landValue)} 억 원</div>
  <div style="display:flex;gap:10px;margin-top:12px">
    <div style="flex:1">
      <div style="font-size:10px;color:rgba(30,41,59,0.5);margin-bottom:4px">기설정 근저당</div>
      <input type="number" value="${state.mortgage}" step="10000000" oninput="updMG(this.value)" style="width:100%;background:rgba(15,23,42,0.06);border:0.5px solid rgba(15,23,42,0.1);border-radius:8px;padding:6px 9px;color:#1E293B;font-size:11px">
    </div>
    <div style="flex:1">
      <div style="font-size:10px;color:rgba(30,41,59,0.5);margin-bottom:4px">소유 형태</div>
      <button type="button" onclick="toggleCorp()" style="width:100%;padding:7px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;background:${state.isCorp ? "rgba(232,89,12,0.18)" : "rgba(15,23,42,0.05)"};border:0.5px solid ${state.isCorp ? "#E8590C" : "rgba(15,23,42,0.1)"};color:${state.isCorp ? "#E8590C" : "rgba(30,41,59,0.5)"}">🏭 ${state.isCorp ? "법인 ✓" : "개인"}</button>
    </div>
  </div>
</div>
<div style="background:#F1F5F9;border:0.5px solid rgba(14,99,255,0.25);border-radius:12px;padding:15px;margin-bottom:12px">
  ${[
    ["총 자산 가치", fmtB(state.landValue) + " 억", "rgba(30,41,59,0.58)"],
    ["근저당 공제", "- " + fmtB(state.mortgage) + " 억", "#FF7B7B"],
    ["안전 버퍼 30%", "- " + fmtB(buf) + " 억", "#FFB347"],
  ]
    .map(
      ([l, v, c]) => `
  <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:11.5px">
    <span style="color:rgba(30,41,59,0.5)">${l}</span>
    <span style="color:${c};font-weight:700">${v}</span>
  </div>`
    )
    .join("")}
  <div style="border-top:0.5px solid rgba(15,23,42,0.09);padding-top:10px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:13px;font-weight:700">최대 발행 한도</span>
    <span style="font-size:26px;font-weight:900;color:#4DD8C4">${fmtB(issuance)} 억</span>
  </div>
</div>
<button type="button" onclick="startTrustFlow()" style="width:100%;padding:14px;border-radius:12px;border:none;background:#E8590C;color:#fff;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.04em">토큰 발행 신청 →</button>
<div style="margin-top:14px;background:#F1F5F9;border-radius:10px;padding:13px;font-family:ui-monospace,monospace;font-size:10px;line-height:2;color:rgba(30,41,59,0.55);border:0.5px solid rgba(14,99,255,0.18)">
  <div style="color:#4DD8C4;font-weight:700">// ERC-3643 SMART CONTRACT</div>
  <div><span style="color:#7BAAFF">SAFETY_BUFFER</span>: 30% LOCKED</div>
  <div><span style="color:#7BAAFF">MORTGAGE_SETTLED</span>: <span style="color:#4DD8C4">TRUE</span></div>
  <div><span style="color:#7BAAFF">KYC_VERIFIED</span>: <span style="color:#4DD8C4">TRUE</span></div>
  <div style="color:#FFB347">&gt; Waiting for LH_2027_Event...</div>
</div>
`;
}

function renderAgg(joined, totalBundle, indivD, bundleD, gain) {
  const aggDisabled = state.animating || (state.aggStep < 3 && joined.length < 2);
  const aggLabel = state.animating
    ? "⟳ 번들 구성 중..."
    : state.aggStep >= 3
      ? "다시 시뮬레이션"
      : "공동매도 실행 (" + joined.length + "명 참여)";
  const aggOnclick = state.aggStep >= 3 ? "resetAgg()" : "runAgg()";

  return `
<div style="background:rgba(77,216,196,0.12);border:0.5px solid rgba(77,216,196,0.32);border-radius:12px;padding:13px;margin-bottom:14px;box-shadow:0 1px 3px rgba(15,23,42,0.04)">
  <div style="font-size:10px;font-weight:700;color:#4DD8C4;letter-spacing:.1em;margin-bottom:4px">💡 조각투자의 역발상 — Asset Aggregation</div>
  <div style="font-size:12.5px;font-weight:800;line-height:1.5;margin-bottom:6px">작은 조각을 모아 <span style="color:#4DD8C4">거대한 협상력</span>으로</div>
  <div style="font-size:10px;color:rgba(30,41,59,0.55);line-height:1.65">개별 지주의 채권을 Bundle로 묶어 기관 투자자(연기금·공제회)와 대등하게 협상 → 할인율 대폭 개선 → 실수령액 증가</div>
</div>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 6px">
  ${["조각 수집", "Bundle 구성", "기관 협상", "매도 완료"]
    .map(
      (step, i) => `
  <div style="display:flex;flex-direction:column;align-items:center;flex:1;position:relative">
    <div style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:${state.aggStep > i ? "#4DD8C4" : state.aggStep === i ? "rgba(77,216,196,0.15)" : "rgba(15,23,42,0.05)"};border:1.5px solid ${state.aggStep >= i ? "#4DD8C4" : "rgba(15,23,42,0.12)"};color:${state.aggStep > i ? "#0F172A" : state.aggStep === i ? "#4DD8C4" : "rgba(30,41,59,0.44)"};transition:all .5s">${state.aggStep > i ? "✓" : i + 1}</div>
    <div style="font-size:8.5px;color:${state.aggStep >= i ? "rgba(30,41,59,0.72)" : "rgba(30,41,59,0.35)"};margin-top:4px;text-align:center">${step}</div>
  </div>`
    )
    .join("")}
</div>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
  <div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.08);border-radius:10px;padding:10px;text-align:center">
    <div style="font-size:18px;font-weight:900;color:#4DD8C4">${joined.length}명</div>
    <div style="font-size:9px;color:rgba(30,41,59,0.45);margin-top:3px">참여 지주</div>
  </div>
  <div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.08);border-radius:10px;padding:10px;text-align:center">
    <div style="font-size:18px;font-weight:900;color:#7BAAFF">${totalBundle.toFixed(1)}억</div>
    <div style="font-size:9px;color:rgba(30,41,59,0.45);margin-top:3px">번들 규모</div>
  </div>
  <div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.08);border-radius:10px;padding:10px;text-align:center">
    <div style="font-size:18px;font-weight:900;color:#FFB347">${state.aggStep >= 3 ? "+" + (indivD - 4) + "%p" : "-"}</div>
    <div style="font-size:9px;color:rgba(30,41,59,0.45);margin-top:3px">할인율 개선</div>
  </div>
</div>

${
  state.aggStep >= 1
    ? `
<div style="background:#F1F5F9;border:0.5px solid rgba(15,23,42,0.08);border-radius:12px;padding:13px;margin-bottom:12px">
  <div style="font-size:11px;font-weight:700;margin-bottom:10px">실수령액 비교</div>
  <div style="display:flex;gap:10px;align-items:center">
    <div style="flex:1;text-align:center">
      <div style="font-size:9px;color:rgba(30,41,59,0.5);margin-bottom:4px">개별 매도</div>
      <div style="font-size:9px;background:rgba(255,100,100,0.1);border:0.5px solid rgba(255,100,100,0.3);border-radius:6px;padding:3px 6px;color:#FF7B7B;margin-bottom:5px;display:inline-block">할인율 ${indivD}%</div>
      <div style="font-size:18px;font-weight:900;color:#FF7B7B">${(totalBundle * (1 - indivD / 100)).toFixed(1)}억</div>
    </div>
    <div style="font-size:20px;color:#4DD8C4">→</div>
    <div style="flex:1;text-align:center">
      <div style="font-size:9px;color:rgba(30,41,59,0.5);margin-bottom:4px">공동매도</div>
      <div style="font-size:9px;background:rgba(77,216,196,0.1);border:0.5px solid rgba(77,216,196,0.3);border-radius:6px;padding:3px 6px;color:#4DD8C4;margin-bottom:5px;display:inline-block">할인율 ${bundleD}%</div>
      <div style="font-size:18px;font-weight:900;color:#4DD8C4">${(totalBundle * (1 - bundleD / 100)).toFixed(1)}억</div>
    </div>
  </div>
  ${
    state.aggStep >= 3
      ? `<div style="margin-top:10px;background:rgba(77,216,196,0.07);border-radius:8px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:10.5px;color:rgba(30,41,59,0.62)">참여 지주 추가 수령액</span>
    <span style="font-size:16px;font-weight:900;color:#4DD8C4">+${gain.toFixed(2)}억 원</span>
  </div>`
      : ""
  }
</div>
`
    : ""
}

<div style="font-size:11px;font-weight:700;color:rgba(30,41,59,0.5);letter-spacing:.08em;margin-bottom:10px">참여 지주 선택</div>
<div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px">
  ${state.pool
    .map(
      (p) => `
  <div role="button" tabindex="0" onclick="togglePool(${p.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();togglePool(${p.id});}" style="background:${p.joined ? "rgba(77,216,196,0.1)" : "#FFFFFF"};border:0.5px solid ${p.joined ? "rgba(77,216,196,0.3)" : "rgba(15,23,42,0.08)"};border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all .2s">
    <div style="width:20px;height:20px;border-radius:50%;background:${p.joined ? "#4DD8C4" : "rgba(15,23,42,0.09)"};display:flex;align-items:center;justify-content:center;font-size:10px;color:${p.joined ? "#0F172A" : "rgba(30,41,59,0.44)"};font-weight:700;flex-shrink:0;transition:all .2s">${p.joined ? "✓" : "+"}</div>
    <div style="flex:1;min-width:0">
      <div style="font-size:11px;font-weight:600;display:flex;justify-content:space-between">
        <span>${p.name} <span style="font-size:9px;color:rgba(30,41,59,0.42)">${p.loc}</span></span>
        <span style="color:#4DD8C4;font-weight:800">${p.amt}억</span>
      </div>
      <div style="font-size:9px;color:rgba(30,41,59,0.42);margin-top:2px">${p.jimok} · ${p.area.toLocaleString()}㎡ ${p.bank !== "-" ? '<span style="color:#7BAAFF">| ' + p.bank + " 근저당</span>" : ""}</div>
    </div>
  </div>`
    )
    .join("")}
</div>

<button type="button" onclick="${aggOnclick}" ${aggDisabled ? "disabled" : ""} style="width:100%;padding:14px;border-radius:12px;border:none;background:${joined.length >= 2 || state.aggStep >= 3 ? "#1D9E75" : "rgba(15,23,42,0.06)"};color:${joined.length >= 2 || state.aggStep >= 3 ? "#fff" : "rgba(30,41,59,0.3)"};font-size:13px;font-weight:700;cursor:${aggDisabled ? "not-allowed" : "pointer"};letter-spacing:.04em">
  ${aggLabel}
</button>
`;
}

function renderTax(taxBase, taxN, taxS) {
  return `
<div style="font-size:11px;font-weight:700;color:rgba(30,41,59,0.5);letter-spacing:.08em;margin-bottom:10px">AI 세금 시뮬레이션</div>
<div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.09);border-radius:14px;padding:14px;margin-bottom:12px">
  <div style="font-size:10px;color:rgba(30,41,59,0.5);margin-bottom:8px">보상 수령 유형 선택</div>
  <div style="display:flex;gap:6px;margin-bottom:14px">
    ${["현금", "채권", "대토"]
      .map(
        (t) => `
    <button type="button" onclick="setTaxType('${t}')" style="flex:1;padding:8px 0;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;background:${state.taxType === t ? "rgba(14,99,255,0.2)" : "rgba(15,23,42,0.05)"};border:0.5px solid ${state.taxType === t ? "#0E63FF" : "rgba(15,23,42,0.1)"};color:${state.taxType === t ? "#7BAAFF" : "rgba(30,41,59,0.48)"}">${t}</button>`
      )
      .join("")}
  </div>
  <div style="background:#F1F5F9;border-radius:10px;padding:12px">
    ${[
      ["과세 표준", "" + taxBase.toFixed(2) + " 억", "rgba(30,41,59,0.62)"],
      ["일반과세 (현금 45%)", "" + taxN.toFixed(2) + " 억", "#FF7B7B"],
      [
        state.taxType === "채권" ? "채권 감면 (38%)" : state.taxType === "대토" ? "대토 감면 (27%)" : "현금 과세 (45%)",
        "" + taxS.toFixed(2) + " 억",
        "#4DD8C4",
      ],
    ]
      .map(
        ([l, v, c]) => `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:11px">
      <span style="color:rgba(30,41,59,0.5)">${l}</span>
      <span style="color:${c};font-weight:700">${v}</span>
    </div>`
      )
      .join("")}
    ${
      state.taxType !== "현금"
        ? `
    <div style="border-top:0.5px solid rgba(15,23,42,0.08);padding-top:8px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;color:rgba(30,41,59,0.58)">절세 효과</span>
      <span style="font-size:17px;font-weight:900;color:#4DD8C4">-${(taxN - taxS).toFixed(2)} 억</span>
    </div>`
        : ""
    }
  </div>
</div>

<div style="font-size:11px;font-weight:700;color:rgba(30,41,59,0.5);letter-spacing:.08em;margin-bottom:10px">법률 증액 서비스 (고구려)</div>
${[
  ["1단계", "정밀 감정가 분석", "10년+ 보상 이력 DB 기반 기대 보상가 산출", "#E8590C"],
  ["2단계", "수용재결 청구", "초기 감정가 부당 시 중앙토지수용위 재결 신청", "#FFB347"],
  ["3단계", "이의재결·행정소송", "재결 불복 시 소송 통한 추가 증액 최대화", "#4DD8C4"],
]
  .map(
    ([step, title, desc, c]) => `
<div style="display:flex;gap:10px;margin-bottom:9px">
  <div style="flex-shrink:0;background:${c};border-radius:6px;padding:3px 8px;font-size:8.5px;font-weight:700;color:#0F172A;margin-top:3px;height:fit-content">${step}</div>
  <div style="flex:1;background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.08);border-radius:8px;padding:8px 10px">
    <div style="font-size:11px;font-weight:700;margin-bottom:2px">${title}</div>
    <div style="font-size:9.5px;color:rgba(30,41,59,0.5)">${desc}</div>
  </div>
</div>`
  )
  .join("")}
`;
}

function renderAsset() {
  return `
<div style="background:rgba(14,99,255,0.12);border:0.5px solid rgba(14,99,255,0.2);border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:0 1px 3px rgba(15,23,42,0.05)">
  <div style="font-size:10px;color:rgba(30,41,59,0.5);margin-bottom:4px">총 재투자 자산</div>
  <div style="font-size:28px;font-weight:900;color:#7BAAFF;margin-bottom:6px">₩ 4억 5,000만</div>
  <div style="display:flex;gap:8px">
    <span style="background:rgba(77,216,196,0.15);border-radius:20px;padding:2px 10px;font-size:10px;color:#4DD8C4">+7.2% YTD</span>
    <span style="background:rgba(14,99,255,0.15);border-radius:20px;padding:2px 10px;font-size:10px;color:#7BAAFF">PB 관리 中</span>
  </div>
</div>
${[["한화 MMF", 40, 4.2, "#7BAAFF"], ["채권형 랩", 35, 6.8, "#4DD8C4"], ["STO 재투자", 15, 7.5, "#E8590C"], ["국고채", 10, 3.5, "#FFB347"]]
  .map(
    ([name, alloc, ret, c]) => `
<div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.08);border-radius:10px;padding:12px 13px;margin-bottom:8px">
  <div style="display:flex;justify-content:space-between;margin-bottom:6px;align-items:center">
    <div style="font-size:12px;font-weight:600">${name}</div>
    <div style="font-size:11px;color:#4DD8C4;font-weight:700">+${ret}%</div>
  </div>
  <div style="background:rgba(15,23,42,0.08);border-radius:4px;height:5px;overflow:hidden">
    <div style="height:100%;width:${alloc}%;background:${c};border-radius:4px"></div>
  </div>
  <div style="font-size:9.5px;color:rgba(30,41,59,0.42);margin-top:4px">비중 ${alloc}%</div>
</div>`
  )
  .join("")}
<div style="background:#FFFFFF;border:0.5px solid rgba(15,23,42,0.08);border-radius:12px;padding:13px;margin-top:4px">
  <div style="font-size:11px;font-weight:700;margin-bottom:8px">커뮤니티 공지</div>
  ${[
    ["방금", "고구려: 평택지제 2차 보상계획 공고 예정 (2025.Q3)"],
    ["1시간", "플랫폼: 신규 번들 공동매도 모집 개시 — 참여 가능"],
    ["3시간", "한화증권: 토지보상 특화 MMF 신상품 출시 안내"],
  ]
    .map(
      ([t, m]) => `
  <div style="display:flex;gap:8px;margin-bottom:8px;font-size:10px">
    <span style="color:rgba(30,41,59,0.35);flex-shrink:0">${t}</span>
    <span style="color:rgba(30,41,59,0.62)">${m}</span>
  </div>`
    )
    .join("")}
</div>
`;
}

function setTab(i) {
  state.tab = i;
  render();
}

function updLV(v) {
  state.landValue = +v;
  render();
}

function updMG(v) {
  state.mortgage = +v;
  render();
}

function toggleCorp() {
  state.isCorp = !state.isCorp;
  render();
}

function togglePool(id) {
  state.pool = state.pool.map((p) => (p.id === id ? { ...p, joined: !p.joined } : p));
  render();
}

function setTaxType(t) {
  state.taxType = t;
  render();
}

function startTrustFlow() {
  showToast("신탁 계약 체결 프로세스를 시작합니다.");
}

function resetAgg() {
  state.aggStep = 0;
  state.animating = false;
  render();
}

async function runAgg() {
  if (state.animating || state.pool.filter((p) => p.joined).length < 2) return;
  state.animating = true;
  state.aggStep = 1;
  render();
  await new Promise((r) => setTimeout(r, 1100));
  state.aggStep = 2;
  render();
  await new Promise((r) => setTimeout(r, 1300));
  state.aggStep = 3;
  state.animating = false;
  render();
}

render();
