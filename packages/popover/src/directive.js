let count = 0;
export default {
  bind(el, binding, vnode) {
    vnode.context.$refs[binding.arg].$refs.reference = el;
    if(!el.id){
      // el.id = `popover-content-${count}`;

      // el.setAttribute('aria-describedby', `popover-content-${count}`);
      const popover = vnode.context.$refs[binding.arg].$refs.popper;
      if (!popover.getAttribute('id')) {
        popover.setAttribute('id', `popover-content-${count}`);
      }
    }
    count++;
  }
};
