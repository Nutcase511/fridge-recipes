export function useShare() {
  function enableShareMenu(): void {
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }

  return { enableShareMenu }
}