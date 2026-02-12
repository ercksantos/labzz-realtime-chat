import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
    describe('Rendering', () => {
        it('renders children correctly', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
        });

        it('renders with default props', () => {
            render(<Button>Default Button</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-primary-500');
            expect(button).not.toBeDisabled();
        });
    });

    describe('Variants', () => {
        it('renders primary variant correctly', () => {
            render(<Button variant="primary">Primary</Button>);
            expect(screen.getByRole('button')).toHaveClass('bg-primary-500');
        });

        it('renders secondary variant correctly', () => {
            render(<Button variant="secondary">Secondary</Button>);
            expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
        });

        it('renders ghost variant correctly', () => {
            render(<Button variant="ghost">Ghost</Button>);
            expect(screen.getByRole('button')).toHaveClass('bg-transparent');
        });

        it('renders danger variant correctly', () => {
            render(<Button variant="danger">Danger</Button>);
            expect(screen.getByRole('button')).toHaveClass('bg-red-500');
        });

        it('renders success variant correctly', () => {
            render(<Button variant="success">Success</Button>);
            expect(screen.getByRole('button')).toHaveClass('bg-green-500');
        });

        it('renders outline variant correctly', () => {
            render(<Button variant="outline">Outline</Button>);
            expect(screen.getByRole('button')).toHaveClass('border-2');
        });
    });

    describe('Sizes', () => {
        it('renders small size correctly', () => {
            render(<Button size="sm">Small</Button>);
            expect(screen.getByRole('button')).toHaveClass('h-8');
        });

        it('renders medium size correctly', () => {
            render(<Button size="md">Medium</Button>);
            expect(screen.getByRole('button')).toHaveClass('h-10');
        });

        it('renders large size correctly', () => {
            render(<Button size="lg">Large</Button>);
            expect(screen.getByRole('button')).toHaveClass('h-12');
        });
    });

    describe('States', () => {
        it('disables button when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('disables button when isLoading is true', () => {
            render(<Button isLoading>Loading</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('shows loading spinner when isLoading is true', () => {
            render(<Button isLoading>Loading</Button>);
            const spinner = screen.getByRole('button').querySelector('svg.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('applies full width class when fullWidth is true', () => {
            render(<Button fullWidth>Full Width</Button>);
            expect(screen.getByRole('button')).toHaveClass('w-full');
        });
    });

    describe('Events', () => {
        it('calls onClick handler when clicked', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Click me</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('does not call onClick when disabled', () => {
            const handleClick = jest.fn();
            render(<Button disabled onClick={handleClick}>Disabled</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('does not call onClick when loading', () => {
            const handleClick = jest.fn();
            render(<Button isLoading onClick={handleClick}>Loading</Button>);

            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        it('supports aria-label', () => {
            render(<Button aria-label="Submit form">Submit</Button>);
            expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
        });

        it('can be focused with keyboard', () => {
            render(<Button>Focusable</Button>);
            const button = screen.getByRole('button');
            button.focus();
            expect(button).toHaveFocus();
        });

        it('has focus ring styles', () => {
            render(<Button>Focus Ring</Button>);
            expect(screen.getByRole('button')).toHaveClass('focus:ring-2');
        });
    });

    describe('Custom className', () => {
        it('merges custom className with default classes', () => {
            render(<Button className="custom-class">Custom</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
            expect(button).toHaveClass('bg-primary-500'); // default styles still apply
        });
    });
});
