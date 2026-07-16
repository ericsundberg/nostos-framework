export const MENU_BUTTON_STYLE = {
  width: 300,
  height: 48,
  radius: 8,

  background: {
    default: '#171b22',
    hover: '#1f2733',
    pressed: '#28384c',
    selected: '#243244',
    disabled: '#12151b',
  },

  border: {
    default: '#394150',
    hover: '#8ecae6',
    selected: '#8ecae6',
    disabled: '#2a303a',
    width: 2,
  },

  text: {
    enabled: '#f5f5f5',
    disabled: '#6f7785',
  },

  font: {
    family: 'Arial, sans-serif',
    size: 24,
    weight: 'bold',
  },
} as const;