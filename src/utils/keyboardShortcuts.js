export const attachKeyboardShortcuts = ({ onEnterWatchVariable, onSaveCode }) => {
  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains('watch-variable-input')) {
        e.preventDefault();
        onEnterWatchVariable();
        return;
      }
    }

    if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      onSaveCode();
    }
  };

  document.addEventListener('keydown', onKeyDown, false);
  return () => document.removeEventListener('keydown', onKeyDown, false);
};
