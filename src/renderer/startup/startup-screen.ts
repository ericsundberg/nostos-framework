const getErrorMessage = (
  error: unknown,
): string => {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  if (
    typeof error === 'string' &&
    error.trim().length > 0
  ) {
    return error;
  }

  return 'An unknown startup error occurred.';
};

export class StartupScreen {
  private readonly root:
    HTMLElement;

  private readonly heading:
    HTMLHeadingElement;

  private readonly message:
    HTMLParagraphElement;

  private readonly details:
    HTMLPreElement;

  public constructor(
    host: HTMLElement,
  ) {
    this.root =
      document.createElement('section');

    this.root.className =
      'startup-screen';

    this.root.setAttribute(
      'aria-live',
      'polite',
    );

    const panel =
      document.createElement('div');

    panel.className =
      'startup-screen__panel';

    const label =
      document.createElement('p');

    label.className =
      'startup-screen__label';

    label.textContent =
      'Nostos Framework';

    this.heading =
      document.createElement('h1');

    this.heading.className =
      'startup-screen__heading';

    this.message =
      document.createElement('p');

    this.message.className =
      'startup-screen__message';

    this.details =
      document.createElement('pre');

    this.details.className =
      'startup-screen__details';

    this.details.hidden = true;

    panel.appendChild(label);
    panel.appendChild(this.heading);
    panel.appendChild(this.message);
    panel.appendChild(this.details);

    this.root.appendChild(panel);
    host.appendChild(this.root);
  }

  public showLoading(
    message =
      'Loading settings and public assets…',
  ): void {
    this.root.dataset.state =
      'loading';

    this.root.setAttribute(
      'role',
      'status',
    );

    this.heading.textContent =
      'Starting the game';

    this.message.textContent =
      message;

    this.details.textContent = '';
    this.details.hidden = true;
  }

  public showError(
    error: unknown,
  ): void {
    this.root.dataset.state =
      'error';

    this.root.setAttribute(
      'role',
      'alert',
    );

    this.heading.textContent =
      'The game could not start';

    this.message.textContent =
      'A required asset or configuration file could not be loaded. Review the public game-assets directory and restart the application.';

    this.details.textContent =
      getErrorMessage(error);

    this.details.hidden = false;
  }

  public destroy(): void {
    this.root.remove();
  }
}