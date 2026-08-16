(() => {
  const PARENT_CONFIRM_PIN = '1234';
  const REWARD_PER_ITEM = 2;

  if (!Array.isArray(state.offlineRewards)) state.offlineRewards = [];

  const style = document.createElement('style');
  style.textContent = '.offline-reward{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:16px;padding:12px;border-radius:14px;background:#fff3d7;border:1px solid #f0d9aa}.offline-reward>div{display:flex;flex-direction:column;gap:3px}.offline-reward small{color:var(--muted)}.offline-reward button{border:0;border-radius:12px;padding:9px 11px;background:#ef9f4f;color:white;font-weight:bold;white-space:nowrap}.offline-calc{padding:10px;border-radius:10px;background:#eef7e8}.offline-calc b{color:#df745e;font-size:20px}.offline-stepper{display:grid;grid-template-columns:42px 1fr 42px;gap:7px}.offline-stepper button{border:1px solid #ded1c1;border-radius:9px;background:#fff;color:#5f8f70;font-size:22px;font-weight:bold}.offline-stepper input{text-align:center;margin:0}';
  document.head.append(style);

  const baseRender = render;
  render = function () {
    baseRender();
    if (!Array.isArray(state.offlineRewards)) state.offlineRewards = [];
    const entries = state.offlineRewards.filter(entry => entry.date === day());
    const count = entries.reduce((sum, entry) => sum + entry.count, 0);
    const points = entries.reduce((sum, entry) => sum + entry.reward, 0);
    $('#offlineToday').textContent = `今天已确认 ${count} 项，共 +${points} 爱心`;
  };

  function normalizedCount() {
    return Math.max(1, Math.min(99, Math.floor(+$('#offlineCount').value || 1)));
  }

  function updateAmount(normalize = false) {
    if ($('#offlineCount').value === '' && !normalize) {
      $('#offlineRewardAmount').textContent = '0';
      $('#offlineGrowthAmount').textContent = '0';
      return;
    }
    const count = normalizedCount();
    if (normalize) $('#offlineCount').value = count;
    $('#offlineRewardAmount').textContent = count * REWARD_PER_ITEM;
    $('#offlineGrowthAmount').textContent = count * REWARD_PER_ITEM;
  }

  $('#offlineRewardBtn').onclick = () => {
    $('#offlineCount').value = 1;
    $('#offlineNote').value = '';
    $('#offlinePin').value = '';
    updateAmount(true);
    $('#offlineRewardDialog').showModal();
  };

  $('#offlineCount').oninput = () => updateAmount(false);
  $('#offlineCount').onblur = () => updateAmount(true);
  $('#offlineMinus').onclick = () => { $('#offlineCount').value = Math.max(1, normalizedCount() - 1); updateAmount(true); };
  $('#offlinePlus').onclick = () => { $('#offlineCount').value = Math.min(99, normalizedCount() + 1); updateAmount(true); };
  $('#confirmOfflineReward').onclick = () => {
    const count = normalizedCount();
    $('#offlineCount').value = count;
    if ($('#offlinePin').value !== PARENT_CONFIRM_PIN) {
      $('#offlinePin').value = '';
      toast('家长确认码不正确');
      return;
    }

    const member = state.members.find(item => item.name === '小宇') || state.members[0];
    if (!member) return toast('请先添加小宇');

    const reward = count * REWARD_PER_ITEM;
    member.hearts += reward;
    state.pet.xp += reward;
    state.offlineRewards.push({
      id: `o${Date.now()}`,
      date: day(),
      time: new Date().toISOString(),
      count,
      reward,
      growth: reward,
      note: $('#offlineNote').value.trim(),
      confirmedBy: '家长'
    });
    save();
    $('#offlineRewardDialog').close();
    ding();
    render();
    toast(`家长已确认，增加 ${reward} 颗爱心和 ${reward} 成长值`);
  };

  render();
})();
