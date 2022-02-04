import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/ui';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { EditMembershipPage } from './EditMembershipPage';

let medplum = new MockClient();

function setup(url: string): void {
  render(
    <MedplumProvider medplum={medplum}>
      <MemoryRouter initialEntries={[url]} initialIndex={0}>
        <Routes>
          <Route path="/admin/projects/:projectId/members/:membershipId" element={<EditMembershipPage />} />
        </Routes>
      </MemoryRouter>
    </MedplumProvider>
  );
}

describe('EditMembershipPage', () => {
  beforeEach(() => {
    medplum = new MockClient();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  test('Renders', async () => {
    setup('/admin/projects/123/members/456');

    await act(async () => {
      await waitFor(() => screen.getByText('Save'));
    });

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('Submit success', async () => {
    setup('/admin/projects/123/members/456');

    await act(async () => {
      await waitFor(() => screen.getByText('Save'));
    });

    expect(screen.getByText('Save')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(screen.getByTestId('success')).toBeInTheDocument();
  });

  test('Submit with access policy', async () => {
    setup('/admin/projects/123/members/456');

    await act(async () => {
      await waitFor(() => screen.getByText('Save'));
    });

    expect(screen.getByText('Save')).toBeInTheDocument();

    const input = screen.getByTestId('input-element') as HTMLInputElement;

    // Enter "Example Access Policy"
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Example Access Policy' } });
    });

    // Wait for the drop down
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await waitFor(() => screen.getByTestId('dropdown'));
    });

    // Press "Enter"
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(screen.getByTestId('success')).toBeInTheDocument();
  });

  test('Submit with admin', async () => {
    const medplumPostSpy = vi.spyOn(medplum, 'post');

    setup('/admin/projects/123/members/456');

    await act(async () => {
      await waitFor(() => screen.getByText('Save'));
    });

    expect(screen.getByText('Save')).toBeInTheDocument();

    const input = screen.getByTestId('admin-checkbox') as HTMLInputElement;

    // Enter "Example Access Policy"
    await act(async () => {
      fireEvent.click(input);
    });

    // Wait for the drop down
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(screen.getByTestId('success')).toBeInTheDocument();

    expect(medplumPostSpy).toHaveBeenCalledWith(
      `admin/projects/123/members/456`,
      expect.objectContaining({
        admin: true,
      })
    );
  });

  test('Remove user accept confirm', async () => {
    setup('/admin/projects/123/members/456');

    await act(async () => {
      await waitFor(() => screen.getByText('Save'));
    });

    expect(screen.getByText('Remove user')).toBeInTheDocument();

    await act(async () => {
      window.confirm = vi.fn(() => true);
      fireEvent.click(screen.getByText('Remove user'));
    });

    expect(screen.getByTestId('success')).toBeInTheDocument();
  });

  test('Remove user reject confirm', async () => {
    setup('/admin/projects/123/members/456');

    await act(async () => {
      await waitFor(() => screen.getByText('Save'));
    });

    expect(screen.getByText('Remove user')).toBeInTheDocument();

    await act(async () => {
      window.confirm = vi.fn(() => false);
      fireEvent.click(screen.getByText('Remove user'));
    });

    expect(screen.queryByTestId('success')).toBeNull();
  });
});
