import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email" id="email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      render(<Input label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders start icon', () => {
      render(
        <Input startIcon={<span data-testid="start-icon">📧</span>} placeholder="With icon" />
      );
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    it('renders end icon', () => {
      render(<Input endIcon={<span data-testid="end-icon">👁</span>} placeholder="With icon" />);
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });

    it('applies correct padding for start icon', () => {
      render(<Input startIcon={<span>Icon</span>} placeholder="With icon" />);
      expect(screen.getByPlaceholderText('With icon')).toHaveClass('pl-10');
    });

    it('applies correct padding for end icon', () => {
      render(<Input endIcon={<span>Icon</span>} placeholder="With icon" />);
      expect(screen.getByPlaceholderText('With icon')).toHaveClass('pr-10');
    });
  });

  describe('Error State', () => {
    it('shows error message', () => {
      render(<Input id="email" error="Invalid email" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    });

    it('has error styling', () => {
      render(<Input id="email" error="Invalid email" placeholder="Email" />);
      expect(screen.getByPlaceholderText('Email')).toHaveClass('border-red-500');
    });

    it('sets aria-invalid to true when error exists', () => {
      render(<Input id="email" error="Invalid email" placeholder="Email" />);
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby to error id', () => {
      render(<Input id="email" error="Invalid email" placeholder="Email" />);
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
        'aria-describedby',
        'email-error'
      );
    });
  });

  describe('Helper Text', () => {
    it('shows helper text when no error', () => {
      render(<Input id="password" helperText="Min 8 characters" placeholder="Password" />);
      expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
    });

    it('hides helper text when error exists', () => {
      render(
        <Input
          id="password"
          helperText="Min 8 characters"
          error="Password too short"
          placeholder="Password"
        />
      );
      expect(screen.queryByText('Min 8 characters')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Password too short');
    });

    it('sets aria-describedby to helper id when no error', () => {
      render(<Input id="password" helperText="Min 8 characters" placeholder="Password" />);
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
        'aria-describedby',
        'password-helper'
      );
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled placeholder="Disabled" />);
      expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
    });

    it('has disabled styling', () => {
      render(<Input disabled placeholder="Disabled" />);
      expect(screen.getByPlaceholderText('Disabled')).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Events', () => {
    it('calls onChange handler', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} placeholder="Type here" />);

      fireEvent.change(screen.getByPlaceholderText('Type here'), {
        target: { value: 'Hello' },
      });

      expect(handleChange).toHaveBeenCalled();
    });

    it('calls onFocus handler', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} placeholder="Focus me" />);

      fireEvent.focus(screen.getByPlaceholderText('Focus me'));
      expect(handleFocus).toHaveBeenCalled();
    });

    it('calls onBlur handler', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} placeholder="Blur me" />);

      const input = screen.getByPlaceholderText('Blur me');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Input Types', () => {
    it('renders as password type', () => {
      render(<Input type="password" placeholder="Password" />);
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
    });

    it('renders as email type', () => {
      render(<Input type="email" placeholder="Email" />);
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
    });

    it('renders as number type', () => {
      render(<Input type="number" placeholder="Number" />);
      expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Input id="email" label="Email Address" aria-required="true" placeholder="Enter email" />
      );

      const input = screen.getByPlaceholderText('Enter email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('can be focused with keyboard', () => {
      render(<Input placeholder="Focusable" />);
      const input = screen.getByPlaceholderText('Focusable');
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-input" placeholder="Custom" />);
      const input = screen.getByPlaceholderText('Custom');
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass('rounded-lg'); // default styles still apply
    });
  });
});
