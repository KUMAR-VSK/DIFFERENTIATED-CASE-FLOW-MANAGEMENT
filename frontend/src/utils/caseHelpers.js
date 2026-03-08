export const getStatusColor = (status) => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800 border-primary-200';
        case 'SCHEDULED':
            return 'bg-cyan-100 text-cyan-800 border-cyan-200';
        case 'UNDER_REVIEW':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'FILED':
            return 'bg-surface-100 text-surface-800 border-surface-200';
        case 'DISMISSED':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-surface-100 text-surface-800 border-surface-200';
    }
};

export const getCaseTypeColor = (caseType) => {
    switch (caseType) {
        case 'CONSTITUTIONAL':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'CRIMINAL':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'CIVIL':
            return 'bg-blue-100 text-blue-800 border-primary-200';
        case 'FAMILY':
            return 'bg-pink-100 text-pink-800 border-pink-200';
        case 'ADMINISTRATIVE':
            return 'bg-surface-100 text-surface-800 border-surface-200';
        default:
            return 'bg-surface-100 text-surface-800 border-surface-200';
    }
};

export const getPriorityColor = (priority) => {
    if (priority >= 9) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
};
