import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

// Mock useFocusTrap hook - capture onEscape callback
let capturedOnEscape: (() => void) | undefined;
jest.mock('@/hooks/useAccessibility', () => ({
    useFocusTrap: (options?: { isActive?: boolean; onEscape?: () => void; returnFocusOnDeactivate?: boolean }) => {
        capturedOnEscape = options?.onEscape;
        return { current: null };
    },
}));

describe('Modal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        title: 'Test Modal',
        children: <p>Modal content</p>,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        capturedOnEscape = undefined;
    });

    describe('Rendering', () => {
        it('renders when isOpen is true', () => {
            render(<Modal {...defaultProps} />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Test Modal')).toBeInTheDocument();
            expect(screen.getByText('Modal content')).toBeInTheDocument();
        });

        it('does not render when isOpen is false', () => {
            render(<Modal {...defaultProps} isOpen={false} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('renders title correctly', () => {
            render(<Modal {...defaultProps} title="Custom Title" />);
            expect(screen.getByText('Custom Title')).toBeInTheDocument();
        });

        it('renders children correctly', () => {
            render(
                <Modal {...defaultProps}>
                    <button>Action Button</button>
                </Modal>
            );
            expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
        });
    });

    describe('Close Behavior', () => {
        it('calls onClose when close button is clicked', () => {
            const onClose = jest.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            const closeButton = screen.getByRole('button', { name: /close modal/i });
            fireEvent.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when backdrop is clicked', () => {
            const onClose = jest.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            // The overlay is the aria-hidden div inside the dialog
            const overlay = screen.getByRole('dialog').querySelector('[aria-hidden="true"]');
            fireEvent.click(overlay!);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('does not close when clicking inside modal content', () => {
            const onClose = jest.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            fireEvent.click(screen.getByText('Modal content'));

            expect(onClose).not.toHaveBeenCalled();
        });

        it('calls onClose when Escape key is pressed', () => {
            const onClose = jest.fn();
            render(<Modal {...defaultProps} onClose={onClose} />);

            // useFocusTrap captures onEscape, so we call it directly
            expect(capturedOnEscape).toBeDefined();
            capturedOnEscape!();

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Sizes', () => {
        it('renders small size correctly', () => {
            render(<Modal {...defaultProps} size="sm" />);
            const contentDiv = screen.getByRole('dialog').querySelector('.relative');
            expect(contentDiv).toHaveClass('max-w-sm');
        });

        it('renders medium size correctly', () => {
            render(<Modal {...defaultProps} size="md" />);
            const contentDiv = screen.getByRole('dialog').querySelector('.relative');
            expect(contentDiv).toHaveClass('max-w-md');
        });

        it('renders large size correctly', () => {
            render(<Modal {...defaultProps} size="lg" />);
            const contentDiv = screen.getByRole('dialog').querySelector('.relative');
            expect(contentDiv).toHaveClass('max-w-lg');
        });

        it('renders extra large size correctly', () => {
            render(<Modal {...defaultProps} size="xl" />);
            const contentDiv = screen.getByRole('dialog').querySelector('.relative');
            expect(contentDiv).toHaveClass('max-w-xl');
        });

        it('renders full size correctly', () => {
            render(<Modal {...defaultProps} size="full" />);
            const contentDiv = screen.getByRole('dialog').querySelector('.relative');
            expect(contentDiv).toHaveClass('max-w-full');
        });
    });

    describe('Accessibility', () => {
        it('has correct ARIA attributes', () => {
            render(<Modal {...defaultProps} />);

            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
        });

        it('close button has accessible name', () => {
            render(<Modal {...defaultProps} />);
            expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
        });

        it('traps focus within modal', async () => {
            const user = userEvent.setup();
            render(
                <Modal {...defaultProps}>
                    <input data-testid="input-1" />
                    <input data-testid="input-2" />
                    <button>Submit</button>
                </Modal>
            );

            // Focus should be manageable within the modal
            const input1 = screen.getByTestId('input-1');
            const input2 = screen.getByTestId('input-2');

            input1.focus();
            expect(input1).toHaveFocus();

            await user.tab();
            expect(input2).toHaveFocus();
        });
    });

    describe('Body Scroll Lock', () => {
        it('prevents body scroll when open', () => {
            render(<Modal {...defaultProps} />);
            expect(document.body.style.overflow).toBe('hidden');
        });

        it('restores body scroll when closed', () => {
            const { rerender } = render(<Modal {...defaultProps} />);
            expect(document.body.style.overflow).toBe('hidden');

            rerender(<Modal {...defaultProps} isOpen={false} />);
            expect(document.body.style.overflow).toBe('unset');
        });
    });
});
