/**
 * <scheme-panel> Web Component
 *
 * Displays all 8 semantic tokens for a colour scheme with sample content.
 *
 * @attr {string} scheme - Scheme class to apply (e.g., "scheme-default", "scheme-dark")
 * @attr {string} title - Display title
 */
class SchemePanel extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  get scheme() {
    return this.getAttribute('scheme') || '';
  }

  get title() {
    return this.getAttribute('title') || this.scheme;
  }

  render() {
    const id = this.scheme.replace(/[^a-z0-9]/g, '');

    const wrapper = document.createElement('div');
    wrapper.className = `box ${this.scheme}`;

    const heading = document.createElement('h3');
    heading.textContent = this.title;
    wrapper.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'grid grid-narrow';

    const tokens = [
      { name: 'Background', bg: 'var(--color-bg)', fg: 'var(--color-fg)', border: '1px solid var(--color-border-muted)' },
      { name: 'Foreground', bg: 'var(--color-fg)', fg: 'var(--color-bg)', border: 'none' },
      { name: 'Subtle', bg: 'var(--color-subtle)', fg: 'var(--color-fg)', border: '1px solid var(--color-border-muted)' },
      { name: 'Accent', bg: 'var(--color-accent)', fg: 'var(--color-white)', border: 'none' },
      { name: 'Accent 2', bg: 'var(--color-accent2)', fg: 'var(--color-white)', border: 'none' },
      { name: 'Muted', bg: 'var(--color-muted)', fg: 'var(--color-bg)', border: 'none' },
      { name: 'Border', bg: 'var(--color-border)', fg: 'var(--color-bg)', border: 'none' },
      { name: 'Border muted', bg: 'var(--color-border-muted)', fg: 'var(--color-fg)', border: '1px solid var(--color-border)' },
    ];

    const tokenCol = document.createElement('div');
    tokenCol.className = 'stack stack-compact';
    const tokenHeading = document.createElement('h4');
    tokenHeading.className = 'text-sm font-semibold mb-025';
    tokenHeading.textContent = 'Semantic tokens';
    tokenCol.appendChild(tokenHeading);

    for (const t of tokens) {
      const swatch = document.createElement('div');
      swatch.style.cssText = `background: ${t.bg}; color: ${t.fg}; border: ${t.border}; padding: var(--line-025);`;
      const label = document.createElement('span');
      label.className = 'text-xs';
      label.textContent = t.name;
      swatch.appendChild(label);
      tokenCol.appendChild(swatch);
    }
    grid.appendChild(tokenCol);

    const sampleCol = document.createElement('div');
    sampleCol.className = 'stack stack-compact';
    const sampleHeading = document.createElement('h4');
    sampleHeading.className = 'text-sm font-semibold mb-025';
    sampleHeading.textContent = 'Sample content';
    sampleCol.appendChild(sampleHeading);

    const bodyP = document.createElement('p');
    bodyP.className = 'text-sm';
    bodyP.append(
      'Body text in ',
      Object.assign(document.createElement('a'), { href: '#', textContent: 'this scheme' }),
      ' with a ',
      Object.assign(document.createElement('strong'), { textContent: 'bold phrase' }),
      ' and ',
      Object.assign(document.createElement('em'), { textContent: 'emphasis' }),
      '.'
    );
    sampleCol.appendChild(bodyP);

    const mutedP = document.createElement('p');
    mutedP.className = 'text-sm text-muted';
    mutedP.textContent = 'Muted secondary text.';
    sampleCol.appendChild(mutedP);

    const accentP = document.createElement('p');
    accentP.className = 'text-sm text-accent';
    accentP.textContent = 'Accent coloured text.';
    sampleCol.appendChild(accentP);

    sampleCol.appendChild(document.createElement('hr'));

    const callout = document.createElement('div');
    callout.className = 'box bg-subtle text-xs p-025';
    const calloutP = document.createElement('p');
    calloutP.append(
      'Subtle background callout with ',
      Object.assign(document.createElement('a'), { href: '#', textContent: 'a link' }),
      '.'
    );
    callout.appendChild(calloutP);
    sampleCol.appendChild(callout);
    grid.appendChild(sampleCol);

    const controlCol = document.createElement('div');
    controlCol.className = 'stack stack-compact';
    const controlHeading = document.createElement('h4');
    controlHeading.className = 'text-sm font-semibold mb-025';
    controlHeading.textContent = 'Controls';
    controlCol.appendChild(controlHeading);

    const field = document.createElement('div');
    field.className = 'field';
    const inputLabel = document.createElement('label');
    inputLabel.htmlFor = `${id}-input`;
    inputLabel.className = 'text-xs';
    inputLabel.textContent = 'Text input';
    const input = document.createElement('input');
    input.type = 'text';
    input.name = id;
    input.id = `${id}-input`;
    input.placeholder = 'Placeholder';
    field.appendChild(inputLabel);
    field.appendChild(input);
    controlCol.appendChild(field);

    const btn1 = document.createElement('button');
    btn1.className = 'button button--small';
    btn1.textContent = 'Button';
    controlCol.appendChild(btn1);

    const btn2 = document.createElement('button');
    btn2.className = 'button button--small button--accent';
    btn2.textContent = 'Accent';
    controlCol.appendChild(btn2);

    grid.appendChild(controlCol);
    wrapper.appendChild(grid);

    this.replaceChildren(wrapper);
  }
}

customElements.define('scheme-panel', SchemePanel);
