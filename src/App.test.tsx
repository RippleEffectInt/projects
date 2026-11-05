import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  window.scrollTo = vi.fn();
});
describe('workspace journeys', () => {
  it('searches, filters and recovers from an empty result', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: 'Search projects' }), 'harvesting');
    expect(screen.getByRole('button', { name: /Harvesting opportunity DEMO/ })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Filter by country'), 'Kenya');
    expect(screen.getByText('No projects match your filters')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    expect(screen.getAllByRole('row')).toHaveLength(9);
  });
  it('prepares and saves an outline preview with explicit simulation language', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Open Growing resilient communities' }));
    await user.click(screen.getByRole('button', { name: 'Prepare approval' }));
    const modal = screen.getByRole('dialog');
    expect(within(modal).getByText('Preview only. No approval will be sent.')).toBeInTheDocument();
    await user.type(
      within(modal).getByLabelText('Submission comments'),
      'Ready for a fictional review.',
    );
    await user.click(within(modal).getByRole('button', { name: 'Review preview' }));
    expect(within(modal).getByText('“1”')).toBeInTheDocument();
    await user.click(within(modal).getByRole('button', { name: 'Save demo preview' }));
    expect(screen.getByRole('status')).toHaveTextContent('No approval was sent');
    await user.click(screen.getByRole('tab', { name: /Approvals/ }));
    await user.click(screen.getByRole('button', { name: /Outline approval preview/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Preview only — not submitted');
  });
  it('recovers from corrupt saved data using a confirmed reset', async () => {
    localStorage.setItem('ripple-projects-demo-v1', 'invalid');
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load demo data');
    await user.click(screen.getByRole('button', { name: 'Reset demo' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Reset demo data' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Your projects, in one place.' }),
    ).toBeInTheDocument();
  });
});
