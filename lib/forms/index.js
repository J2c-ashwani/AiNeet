import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Centralized Form Architecture System
// All forms must use these re-exported primitives to ensure consistent validation schemas and resolvers.
export {
    useForm,
    zodResolver,
    z
};
