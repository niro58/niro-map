/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			typography: () => ({
				primary: {
					css: {
						'--tw-prose-body': 'var(--foreground)',
						'--tw-prose-headings': 'var(--primary)',
						'--tw-prose-lead': 'var(--muted-foreground)',
						'--tw-prose-links': 'var(--primary)',
						'--tw-prose-bold': 'var(--primary)',
						'--tw-prose-counters': 'var(--muted-foreground)',
						'--tw-prose-bullets': 'var(--muted)',
						'--tw-prose-hr': 'var(--border)',
						'--tw-prose-quotes': 'var(--primary)',
						'--tw-prose-quote-borders': 'var(--border)',
						'--tw-prose-captions': 'var(--muted-foreground)',
						'--tw-prose-code': 'var(--primary)',
						'--tw-prose-pre-code': 'var(--background)',
						'--tw-prose-pre-bg': 'var(--primary)',
						'--tw-prose-th-borders': 'var(--border)',
						'--tw-prose-td-borders': 'var(--muted)',
						'--tw-prose-invert-body': 'var(--background)',
						'--tw-prose-invert-headings': 'var(--foreground)',
						'--tw-prose-invert-lead': 'var(--muted)',
						'--tw-prose-invert-links': 'var(--foreground)',
						'--tw-prose-invert-bold': 'var(--foreground)',
						'--tw-prose-invert-counters': 'var(--muted)',
						'--tw-prose-invert-bullets': 'var(--muted)',
						'--tw-prose-invert-hr': 'var(--border)',
						'--tw-prose-invert-quotes': 'var(--background)',
						'--tw-prose-invert-quote-borders': 'var(--border)',
						'--tw-prose-invert-captions': 'var(--muted)',
						'--tw-prose-invert-code': 'var(--foreground)',
						'--tw-prose-invert-pre-code': 'var(--muted)',
						'--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
						'--tw-prose-invert-th-borders': 'var(--muted)',
						'--tw-prose-invert-td-borders': 'var(--border)'
					}
				}
			})
		}
	}
};
