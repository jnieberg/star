export function toSize(size) {
	return `${Math.round(size * 1000000).toLocaleString('en-US')}km`;
}


export function toSizeString(size) {
	return size < 1 ?
		'Dwarf' :
		size < 3 ?
			'Star' :
			size < 4 ?
				'Giant' :
				size < 4.5 ?
					'Supergiant' :
					'Hypergiant';
}
