import { cookies } from 'next/headers';

export const isAdmin = () => cookies().get('admin')?.value === '1';
