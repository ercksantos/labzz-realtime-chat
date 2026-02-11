import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Get locale from cookie or use default
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'pt-BR';

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
