import { createTransitionConfig, transitions } from 'ssgoi';

export default createTransitionConfig({
	transitions: [
		{
			from: '/blog',
			to: '/blog/*',
			transitions: transitions.hero()
		},
		{
			from: '/blog/*',
			to: '/blog',
			transitions: transitions.hero()
		}
	],
	defaultTransition: transitions.none()
});
