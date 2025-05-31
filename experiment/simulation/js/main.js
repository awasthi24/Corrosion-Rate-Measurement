const rodColors = {
      iron:   { initial: "#7D7D7D", final: "#8B0000" },
      zinc:   { initial: "#A2C5D3", final: "#435966" },
      copper: { initial: "#B87333", final: "#228B22" }
  };
  const electrolyteColors = {
      water: "#E3FAF8",
      nacl: "#1E90FF",
      h2so4: "#F3FCB1"
  };
  const ionColors = {
      iron: ["#FFD600", "#C0C0C0"],
      zinc: ["#FFD600", "#A2C5D3"],
      copper: ["#FFD600", "#B87333"]
  };
  const modeMatrix = {
      iron:   { water: 2, nacl: 4, h2so4: 5 },
      zinc:   { water: 1, nacl: 3, h2so4: 4 },
      copper: { water: 0, nacl: 0, h2so4: 1 }
  };
  const modeToRodPercent = { 0:0, 1:0.15, 2:0.30, 3:0.45, 4:0.60, 5:0.75 };
  const modeToIonSpeed = { 0:0, 1:0.5, 2:1, 3:1.7, 4:2.3, 5:3 };
  const concentrationMap = {1: '0.1M', 2: '1M', 3: '4M', 4: '7M', 5: '10M'};
  const timeMap = {1: '1 hr', 2: '3 hr', 3: '5 hr', 4: '7 hr', 5: '10 hr'};
  const tempMap = {1: '25°C', 2: '40°C', 3: '60°C', 4: '80°C', 5: '100°C'};
  const reactionTable = {
      iron: {
          water:  {ox: "Fe → Fe²⁺ + 2e⁻", red: "O₂ + 2H⁺ + 2e⁻ → H₂O"},
          nacl:   {ox: "Fe → Fe²⁺ + 2e⁻", red: "O₂ + 2H₂O + 4e⁻ → 4OH⁻"},
          h2so4:  {ox: "Fe → Fe²⁺ + 2e⁻", red: "2H⁺ + 2e⁻ → H₂"}
      },
      zinc: {
          water:  {ox: "Zn → Zn²⁺ + 2e⁻", red: "2H₂O + 2e⁻ → H₂ + 2OH⁻"},
          nacl:   {ox: "Zn → Zn²⁺ + 2e⁻", red: "2Cl⁻ + 2e⁻ → Cl₂"},
          h2so4:  {ox: "Zn → Zn²⁺ + 2e⁻", red: "2H⁺ + 2e⁻ → H₂"}
      },
      copper: {
          water:  {ox: "No reaction", red: "No reaction"},
          nacl:   {ox: "No reaction", red: "No reaction"},
          h2so4:  {ox: "Cu → Cu²⁺ + 2e⁻", red: "2H₂SO₄ + 2e⁻ → CuSO₄ + SO₂"}
      }
  };

  // ------- DOM -------
  const instructionsText = document.getElementById('instructions-text');
  const metalBtns = document.querySelectorAll('#metal-btn-group .img-btn');
  const electrolyteBtns = document.querySelectorAll('#electrolyte-btn-group .img-btn');
  const concentrationSlider = document.getElementById('concentration-slider');
  const timeSlider = document.getElementById('time-slider');
  const tempSlider = document.getElementById('temp-slider');
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const corrosionRateDiv = document.getElementById('corrosion-rate');
  const oxidationDiv = document.getElementById('oxidation-reaction');
  const reductionDiv = document.getElementById('reduction-reaction');
  const clockTime = document.getElementById('clock-time');
  const simCanvas = document.getElementById('sim-canvas');
  const ctx = simCanvas.getContext('2d');
  const popupBg = document.getElementById('popup-bg');
  const simulatorCanvasDiv = document.getElementById('simulator-canvas');

  // ------- STATE -------
  let stage = 0;
  let selectedMetal = null;
  let selectedElectrolyte = null;
  let simInterval = null;
  let clockInterval = null;
  let ions = [];
  let rodTransition = 0;
  let modeAvg = 0;
  let endingIonsFade = false;
  let elapsedClock = 0;
  let rodPlaced = false;
  let electrolytePlaced = false;
  let dragMetalImg = null;
  let ghostRod = null;
  let ghostElectrolyte = null;
  let fillAnimDiv = null;
  let dragElectrolyteEl = null;

  // ------- UI/Utility Functions -------
  function updateInstructions() {
      if (!rodPlaced) return instructionsText.innerText = "Step 1: Select and drag the metal rod to the beaker";
      if (!electrolytePlaced) return instructionsText.innerText = "Step 2: Drag the electrolyte icon into the beaker";
      if (stage === 2) return instructionsText.innerText = "Step 3: Adjust parameters and start experiment";
      if (stage === 3) return instructionsText.innerText = "Step 4: Wait till reaction completes";
      if (stage === 4) return instructionsText.innerText = "Reaction ends. Press Reset";
      instructionsText.innerText = "";
  }
  function updateControls() {
      electrolyteBtns.forEach(b => b.disabled = (!rodPlaced));
      let enableParams = (rodPlaced && electrolytePlaced);
      concentrationSlider.disabled = !enableParams;
      timeSlider.disabled = !enableParams;
      tempSlider.disabled = !enableParams;
      startBtn.disabled = !enableParams;
      resetBtn.disabled = (stage < 3);
  }
  function clearResult() {
      corrosionRateDiv.innerText = "Corrosion Rate: --";
      oxidationDiv.innerText = "Oxidation: --";
      reductionDiv.innerText = "Reduction: --";
  }
  function showPopup() { popupBg.style.display = 'flex'; popupBg.style.pointerEvents = "none"; resetBtn.style.zIndex = 10001; resetBtn.disabled = false; }
  function hidePopup() { popupBg.style.display = 'none'; popupBg.style.pointerEvents = "none"; resetBtn.style.zIndex = ""; }

  // ------- Ghost Outlines -------
  function showGhostRod() {
      if (ghostRod) ghostRod.remove();
      ghostRod = document.createElement('div');
      ghostRod.className = "ghost-rod-outline";
      ghostRod.style.left = "210px";
      ghostRod.style.top = "40px";
      ghostRod.style.width = "40px";
      ghostRod.style.height = "280px";
      simulatorCanvasDiv.appendChild(ghostRod);
  }
  function hideGhostRod() { if (ghostRod) { ghostRod.remove(); ghostRod = null; } }
  function showGhostElectrolyte() {
      if (ghostElectrolyte) ghostElectrolyte.remove();
      ghostElectrolyte = document.createElement('div');
      ghostElectrolyte.className = "ghost-electrolyte-outline";
      ghostElectrolyte.style.left = "60px";
      ghostElectrolyte.style.top = "75px";
      ghostElectrolyte.style.width = "340px";
      ghostElectrolyte.style.height = "220px";
      simulatorCanvasDiv.appendChild(ghostElectrolyte);
  }
  function hideGhostElectrolyte() { if (ghostElectrolyte) { ghostElectrolyte.remove(); ghostElectrolyte = null; } }

  /*function flashBeaker(color, ms) {
      let beaker = document.createElement('div');
      beaker.style.position = "absolute";
      beaker.style.left = "60px";
      beaker.style.top = "40px";
      beaker.style.width = "340px";
      beaker.style.height = "282px";
      beaker.style.borderRadius = "30px/19px";
      beaker.style.background = color;
      beaker.style.opacity = "0.23";
      beaker.style.zIndex = "111";
      simulatorCanvasDiv.appendChild(beaker);
      setTimeout(() => beaker.remove(), ms);
  }*/

  // ------- METAL DRAG & DROP -------
  metalBtns.forEach(btn => {
      const img = btn.querySelector("img");
      img.style.cursor = "grab";
      img.addEventListener('mousedown', function(ev) {
          if (rodPlaced) return;
          ev.preventDefault();
          startMetalDrag(img, btn, false, ev);
      });
      img.addEventListener('touchstart', function(ev) {
          if (rodPlaced) return;
          ev.preventDefault();
          startMetalDrag(img, btn, true, ev);
      }, {passive:false});
  });
  function startMetalDrag(img, btn, isTouch=false, ev=null) {
      if (dragMetalImg) dragMetalImg.remove();
      dragMetalImg = document.createElement('img');
      dragMetalImg.src = img.src;
      dragMetalImg.className = "draggable-metal-img";
      dragMetalImg.style.width = "54px";
      dragMetalImg.style.height = "54px";
      let x, y;
      if (isTouch && ev) {
          x = ev.touches[0].clientX - 27;
          y = ev.touches[0].clientY - 27;
      } else if (ev) {
          x = ev.clientX - 27;
          y = ev.clientY - 27;
      } else {
          x = 0; y = 0;
      }
      dragMetalImg.style.left = x + "px";
      dragMetalImg.style.top = y + "px";
      document.body.appendChild(dragMetalImg);

      showGhostRod();
      let offsetX = 27, offsetY = 27, dragging = true;
      let metal = btn.getAttribute('data-metal');
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('touchmove', dragMove, {passive:false});
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchend', dragEnd);

      function dragMove(e) {
          let pageX, pageY;
          if (e.touches) {
              pageX = e.touches[0].clientX;
              pageY = e.touches[0].clientY;
          } else {
              pageX = e.clientX;
              pageY = e.clientY;
          }
          dragMetalImg.style.left = (pageX - offsetX) + "px";
          dragMetalImg.style.top = (pageY - offsetY) + "px";
          if (rodInGhost(pageX - offsetX, pageY - offsetY, dragMetalImg)) {
              ghostRod.style.borderColor = "#00FFF7";
              ghostRod.style.opacity = 0.63;
          } else {
              ghostRod.style.borderColor = "#00FFF7";
              ghostRod.style.opacity = 0.4;
          }
      }
      function dragEnd(e) {
          dragging = false;
          document.removeEventListener('mousemove', dragMove);
          document.removeEventListener('touchmove', dragMove);
          document.removeEventListener('mouseup', dragEnd);
          document.removeEventListener('touchend', dragEnd);
          let rect = dragMetalImg.getBoundingClientRect();
          let x = rect.left, y = rect.top;
          if (rodInGhost(x, y, dragMetalImg)) {
              dragMetalImg.style.transition = "all 0.3s cubic-bezier(.24,1.85,.51,-0.2)";
              let ghostRect = ghostRod.getBoundingClientRect();
              dragMetalImg.style.left = (ghostRect.left + ghostRect.width/2 - 27) + "px";
              dragMetalImg.style.top = (ghostRect.top + ghostRect.height/2 - 27) + "px";
              dragMetalImg.classList.add("snap-anim");
              setTimeout(() => {
                  dragMetalImg.remove();
                  dragMetalImg = null;
                  rodPlaced = true;
                  selectedMetal = metal;
                  hideGhostRod();
                  updateInstructions();
                  updateControls();
                  drawInitialCanvas();
                  flashBeaker("#00FFF7", 160);
              }, 310);
          } else {
              dragMetalImg.remove();
              dragMetalImg = null;
              hideGhostRod();
          }
      }
  }
  function rodInGhost(x, y, dragEl) {
      if (!ghostRod) return false;
      let ghostRect = ghostRod.getBoundingClientRect();
      let rodRect = dragEl.getBoundingClientRect();
      let overlap = !(rodRect.right < ghostRect.left + 8 ||
                      rodRect.left > ghostRect.right - 8 ||
                      rodRect.bottom < ghostRect.top + 10 ||
                      rodRect.top > ghostRect.bottom - 10);
      return overlap;
  }

  // ------- ELECTROLYTE DRAG & DROP -------
  electrolyteBtns.forEach(btn => {
      btn.disabled = true;
      const img = btn.querySelector("img");
      img.style.cursor = "grab";
      img.addEventListener('mousedown', function(ev) {
          if (!rodPlaced || electrolytePlaced) return;
          ev.preventDefault();
          startElectrolyteDrag(img, btn);
      });
      img.addEventListener('touchstart', function(ev) {
          if (!rodPlaced || electrolytePlaced) return;
          ev.preventDefault();
          startElectrolyteDrag(img, btn, true, ev);
      }, {passive:false});
  });
  function startElectrolyteDrag(img, btn, isTouch = false, touchEv = null) {
      if (dragElectrolyteEl) dragElectrolyteEl.remove();
      dragElectrolyteEl = document.createElement('img');
      dragElectrolyteEl.className = 'draggable-electrolyte';
      dragElectrolyteEl.src = img.src;
      dragElectrolyteEl.style.width = "54px";
      dragElectrolyteEl.style.height = "54px";
      let x, y;
      if (isTouch && touchEv) {
          x = touchEv.touches[0].clientX - 27;
          y = touchEv.touches[0].clientY - 27;
      } else {
          x = event.clientX - 27;
          y = event.clientY - 27;
      }
      dragElectrolyteEl.style.left = x + "px";
      dragElectrolyteEl.style.top = y + "px";
      dragElectrolyteEl.style.opacity = "0.96";
      dragElectrolyteEl.style.boxShadow = "0 6px 18px #0007";
      dragElectrolyteEl.style.position = "absolute";
      dragElectrolyteEl.style.zIndex = "91";
      document.body.appendChild(dragElectrolyteEl);

      let offsetX = 27, offsetY = 27, dragging = true;
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('touchmove', dragMove, {passive:false});
      document.addEventListener('mouseup', dragEnd);
      document.addEventListener('touchend', dragEnd);

      if (!ghostElectrolyte) showGhostElectrolyte();

      function dragMove(e) {
          let pageX, pageY;
          if (e.touches) {
              pageX = e.touches[0].clientX;
              pageY = e.touches[0].clientY;
          } else {
              pageX = e.clientX;
              pageY = e.clientY;
          }
          dragElectrolyteEl.style.left = (pageX - offsetX) + "px";
          dragElectrolyteEl.style.top = (pageY - offsetY) + "px";
          if (electrolyteInGhost(pageX - offsetX, pageY - offsetY)) {
              ghostElectrolyte.style.borderColor = "#00FFF7";
              ghostElectrolyte.style.opacity = 0.41;
          } else {
              ghostElectrolyte.style.borderColor = "#00FFF7";
              ghostElectrolyte.style.opacity = 0.22;
          }
      }
      function dragEnd(e) {
          dragging = false;
          document.removeEventListener('mousemove', dragMove);
          document.removeEventListener('touchmove', dragMove);
          document.removeEventListener('mouseup', dragEnd);
          document.removeEventListener('touchend', dragEnd);
          let rect = dragElectrolyteEl.getBoundingClientRect();
          let x = rect.left, y = rect.top;
          if (electrolyteInGhost(x, y)) {
              dragElectrolyteEl.style.transition = "all 0.3s cubic-bezier(.24,1.85,.51,-0.2)";
              let ghostRect = ghostElectrolyte.getBoundingClientRect();
              dragElectrolyteEl.style.left = (ghostRect.left + ghostRect.width/2 - 27) + "px";
              dragElectrolyteEl.style.top = (ghostRect.top + ghostRect.height/2 - 27) + "px";
              dragElectrolyteEl.classList.add("snap-anim");
              setTimeout(() => {
                  dragElectrolyteEl.remove();
                  dragElectrolyteEl = null;
                  electrolytePlaced = true;
                  selectedElectrolyte = btn.getAttribute('data-electrolyte');
                  hideGhostElectrolyte();
                  animateElectrolyteFill(selectedElectrolyte, () => {
                      updateInstructions();
                      updateControls();
                      drawInitialCanvas();
                      flashBeaker("#00FFF7", 110);
                  });
              }, 310);
          } else {
              dragElectrolyteEl.remove();
              dragElectrolyteEl = null;
              hideGhostElectrolyte();
          }
      }
  }
  function electrolyteInGhost(x, y) {
      if (!ghostElectrolyte) return false;
      let ghostRect = ghostElectrolyte.getBoundingClientRect();
      let elRect = dragElectrolyteEl.getBoundingClientRect();
      let overlap = !(elRect.right < ghostRect.left + 10 ||
                      elRect.left > ghostRect.right - 10 ||
                      elRect.bottom < ghostRect.top + 10 ||
                      elRect.top > ghostRect.bottom - 10);
      return overlap;
  }
  function animateElectrolyteFill(electrolyte, cb) {
      if (fillAnimDiv) fillAnimDiv.remove();
      fillAnimDiv = document.createElement('canvas');
      fillAnimDiv.className = "electrolyte-fill-anim";
      fillAnimDiv.width = 340; fillAnimDiv.height = 220;
      simulatorCanvasDiv.appendChild(fillAnimDiv);
      let fctx = fillAnimDiv.getContext('2d');
      let frac = 0;
      let color = electrolyteColors[electrolyte];
      function drawFill(frac) {
          fctx.clearRect(0,0,340,220);
          fctx.save();
          fctx.globalAlpha = 0.91;
          fctx.fillStyle = color;
          fctx.beginPath();
          fctx.ellipse(170,220-24,150,22,0,0,Math.PI*2,false);
          fctx.fill();
          let h = Math.round(220*frac);
          fctx.fillRect(12, 220-h, 315, h);
          fctx.restore();
      }
      let anim = setInterval(() => {
          frac += 0.04;
          if (frac > 1) frac = 1;
          drawFill(frac);
          if (frac === 1) {
              clearInterval(anim);
              setTimeout(() => { fillAnimDiv.remove(); fillAnimDiv=null; if(cb)cb(); }, 220);
          }
      }, 16);
  }

  // ------- Sliders -------
  function updateSliderFill(r) {
      let percent = ((r.value - r.min) / (r.max - r.min)) * 100;
      r.style.setProperty('--slider-fill-percent', percent + '%');
  }
  [concentrationSlider, timeSlider, tempSlider].forEach(slider => {
      slider.addEventListener('input', function() {
          updateSliderFill(this);
          if (selectedElectrolyte && electrolytePlaced) drawInitialCanvas();
      });
      updateSliderFill(slider);
  });

  // ------- Simulation logic -------
  startBtn.addEventListener('click', () => {
      if (!rodPlaced || !electrolytePlaced) return;
      stage = 3;
      updateInstructions();
      updateControls();
      runSimulation();
      resetBtn.disabled = false;
      hidePopup();
  });
  resetBtn.addEventListener('click', resetAll);

  function getModeAvg() {
      const m1 = modeMatrix[selectedMetal][selectedElectrolyte];
      const m2 = Number(concentrationSlider.value);
      const m3 = Number(timeSlider.value);
      const m4 = Number(tempSlider.value);
      if (m1 === 0 || m2 === 0 || m3 === 0 || m4 === 0) return 0;
      return Math.round((m1 + m2 + m3 + m4)/4);
  }

  // --- SIMULATION CLOCK LOGIC (1hr = 3sec, 1min = 0.05sec, show update every minute) ---
  // ------- FIXED RODTRANSITION LOGIC BELOW -------
  function runSimulation() {
      modeAvg = getModeAvg();
      if (
          modeMatrix[selectedMetal][selectedElectrolyte] === 0 ||
          Number(concentrationSlider.value) === 0 ||
          Number(timeSlider.value) === 0 ||
          Number(tempSlider.value) === 0 ||
          modeAvg === 0
      ) {
          setTimeout(() => {
              showPopup();
              stage = 4;
              updateInstructions();
              resetBtn.disabled = false;
          }, 400);
          corrosionRateDiv.innerText = "Corrosion Rate: 0";
          oxidationDiv.innerText = "Oxidation: No reaction";
          reductionDiv.innerText = "Reduction: No reaction";
          drawInitialCanvas();
          return;
      }
      // 1hr = 3 sec; 1min = 0.05sec
      var userHrs = Number(timeMap[timeSlider.value].split(' ')[0]);
      var userMins = 0;
      var totalClockMinutes = userHrs * 60 + userMins;
      var totalSimSeconds = totalClockMinutes * 0.05; // (1min = 0.05s)

      let rodPercent = modeToRodPercent[modeAvg];
      rodTransition = 0;
      ions = [];
      endingIonsFade = false;
      elapsedClock = 0;
      drawInitialCanvas();
      document.querySelector("#simulator-clock #clock-time").textContent = "00:00";
      clearInterval(clockInterval);

      let displayedMinutes = 0;
      let totalTicks = totalClockMinutes; // one tick per minute
      let tickIntervalMs = 50; // 0.05 sec per min = 50ms per tick

      clockInterval = setInterval(() => {
          displayedMinutes++;
          let hrs = Math.floor(displayedMinutes / 60);
          let mins = displayedMinutes % 60;
          let out = (hrs < 10 ? "0" : "") + hrs + ":" + (mins < 10 ? "0" : "") + mins;
          document.querySelector("#simulator-clock #clock-time").textContent = out;
          if (displayedMinutes >= totalClockMinutes) {
              clearInterval(clockInterval);
              endingIonsFade = true;
              setTimeout(() => {
                  clearInterval(simInterval);
                  stage = 4;
                  updateInstructions();
                  updateControls();
                  showResults();
              }, 1200);
          }
      }, tickIntervalMs);

      clearInterval(simInterval);
      // FIX: Animate rodTransition from 0 to 1, not up to rodPercent!
      let totalRodAnimFrames = totalSimSeconds * 60;
      simInterval = setInterval(() => {
          if (rodTransition < 1) {
              rodTransition += 1 / totalRodAnimFrames;
              if (rodTransition > 1) rodTransition = 1;
          }
          updateIons(modeAvg, totalSimSeconds, endingIonsFade);
          drawSimulation(rodTransition, ions, rodPercent, modeAvg);
      }, 1000/60);
  }

  // ------- Drawing Functions -------
  function drawInitialCanvas() {
      ctx.clearRect(0, 0, simCanvas.width, simCanvas.height);
      drawBeaker();
      if (electrolytePlaced && selectedElectrolyte) drawElectrolyte(selectedElectrolyte);
      if (rodPlaced && selectedMetal) drawRod(selectedMetal, rodColors[selectedMetal].initial, 1);
  }
  function drawSimulation(rodTrans, ionsArr, rodPercent, modeAvg) {
      ctx.clearRect(0, 0, simCanvas.width, simCanvas.height);
      drawBeaker();
      if (electrolytePlaced && selectedElectrolyte) drawElectrolyte(selectedElectrolyte);
      if (rodPlaced && selectedMetal) drawRodTransition(selectedMetal, rodTrans, rodPercent);
      ionsArr.forEach(ion => drawIon(ion));
  }
  function drawBeaker() {
      ctx.save();
      ctx.strokeStyle = "rgba(138, 215, 255, 0.77)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(60, 40); ctx.lineTo(60, 320);
      ctx.moveTo(400, 40); ctx.lineTo(400, 320);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(230, 320, 170, 26, 0, 0, 2*Math.PI, false);
      ctx.stroke();
      ctx.globalAlpha = 0.23;
      ctx.fillStyle = "#aee7ff";
      ctx.beginPath();
      ctx.ellipse(230, 320, 170, 26, 0, 0, 2*Math.PI, false);
      ctx.fill();
      ctx.restore();
  }
  function drawElectrolyte(electrolyte) {
      let fillY = 295;
      let fillHeight = 220;
      let fillColor = electrolyteColors[electrolyte];
      let c = Number(concentrationSlider.value);
      let t = Number(timeSlider.value);
      let temp = Number(tempSlider.value);
      let opacity = 0.91 + 0.015 * ((c + t + temp) / 3 - 1);
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.ellipse(230, fillY, 170, 24, 0, Math.PI*2, false);
      ctx.fill();
      ctx.fillRect(60, fillY-fillHeight, 340, fillHeight);
      ctx.restore();
  }
  function drawRod(metal, color, fillFrac=1) {
      const rodY = 40;
      const rodH = 280;
      ctx.save();
      ctx.beginPath();
      ctx.rect(210, rodY, 40, rodH * fillFrac);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
  }
  function drawRodTransition(metal, rodTransition, rodPercent) {
      let rodH = 280, rodY = 40;
      let transH = rodTransition * rodPercent * rodH;
      if (isNaN(transH) || rodPercent === 0) transH = 0;

      ctx.save();
      // Uncorroded part
      ctx.beginPath();
      ctx.rect(210, rodY, 40, rodH - transH);
      ctx.fillStyle = rodColors[metal].initial;
      ctx.fill();

      // Corroded part (from bottom up to transH)
      if (transH > 0) {
          let grad = ctx.createLinearGradient(0, rodY + rodH - transH, 0, rodY + rodH);
          grad.addColorStop(0, rodColors[metal].initial);
          grad.addColorStop(1, rodColors[metal].final);
          ctx.beginPath();
          ctx.rect(210, rodY + rodH - transH, 40, transH);
          ctx.fillStyle = grad;
          ctx.fill();
      }
      ctx.restore();
  }

  // ------- Ions & Results -------
  function updateIons(mode, simSeconds, fadeAll=false) {
      if (mode === 0) { ions = []; return; }
      let speed = modeToIonSpeed[mode];
      if (!fadeAll && Math.random() < 0.13 * speed) {
          let ionPair = ionColors[selectedMetal];
          ions.push({
              x: 230-32+Math.random()*18, y: 318, color: ionPair[0], vy: -speed, vx: (Math.random()-0.5)*speed, type: "e", alpha: 1
          });
          ions.push({
              x: 230+32-Math.random()*18, y: 318, color: ionPair[1], vy: -speed, vx: (Math.random()-0.5)*speed, type: "m", alpha: 1
          });
      }
      // Electrolyte top surface
      const fluidY = 295 - 220;
      const disappearY = fluidY + 20; // disappear just before top surface
      ions.forEach(ion => {
          ion.x += ion.vx + (Math.random()-0.5)*0.4;
          ion.y += ion.vy + (Math.random()-0.5)*0.2;
          if (ion.x < 68) { ion.x = 68; ion.vx *= -1; }
          if (ion.x > 392) { ion.x = 392; ion.vx *= -1; }
          if (ion.x > 210 && ion.x < 250 && ion.y > 40 && ion.y < 320) {
              if (ion.x < 230) ion.x = 210;
              else ion.x = 250;
              ion.vx *= -1;
          }
          if (ion.y < disappearY) {
              ion.alpha -= 0.09;
              if (ion.alpha < 0) ion.alpha = 0;
          }
          if (fadeAll) {
              ion.alpha -= 0.033;
              if (ion.alpha < 0) ion.alpha = 0;
          }
      });
      ions = ions.filter(ion => ion.y > fluidY && ion.y < 318 && ion.alpha > 0.01);
  }
  function drawIon(ion) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ion.x, ion.y, 7, 0, Math.PI*2);
      ctx.globalAlpha = (ion.type === "e" ? 0.7 : 0.88) * ion.alpha;
      ctx.fillStyle = ion.color;
      ctx.shadowColor = ion.color;
      ctx.shadowBlur = 5 * ion.alpha;
      ctx.fill();
      ctx.restore();
  }
  function showResults() {
      const timeHrs = Number(timeSlider.value) === 1 ? 1 : Number(timeMap[timeSlider.value].split(' ')[0]);
      const corrosionRate = (10 / (5 * timeHrs)).toFixed(2);
      corrosionRateDiv.innerHTML = `Corrosion Rate: ${corrosionRate} <span style="font-size:1.6vh;color:#00FFF7;">µpy</span>`;
      const rxn = reactionTable[selectedMetal][selectedElectrolyte];
      oxidationDiv.innerText = "Oxidation: " + (rxn ? rxn.ox : "--");
      reductionDiv.innerText = "Reduction: " + (rxn ? rxn.red : "--");
  }
  function resetAll() {
      hidePopup();
      stage = 0;
      rodPlaced = false;
      electrolytePlaced = false;
      selectedMetal = null;
      selectedElectrolyte = null;
      metalBtns.forEach(b => b.classList.remove('selected'));
      electrolyteBtns.forEach(b => { b.classList.remove('selected'); b.disabled = true; });
      concentrationSlider.value = 1;
      timeSlider.value = 1;
      tempSlider.value = 1;
      updateSliderFill(concentrationSlider);
      updateSliderFill(timeSlider);
      updateSliderFill(tempSlider);
      updateInstructions();
      updateControls();
      clearResult();
      clearInterval(simInterval);
      clearInterval(clockInterval);
      document.querySelector("#simulator-clock #clock-time").textContent = "00:00";
      elapsedClock = 0;
      if (dragMetalImg) dragMetalImg.remove();
      if (dragElectrolyteEl) dragElectrolyteEl.remove();
      hideGhostRod();
      hideGhostElectrolyte();
      if (fillAnimDiv) fillAnimDiv.remove();
      drawInitialCanvas();
  }

  // ------- INIT -------
  drawInitialCanvas();

//Your JavaScript goes in here
