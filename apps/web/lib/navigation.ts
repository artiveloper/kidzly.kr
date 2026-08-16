export function saveDaycareReturnUrl() {
    if (!window.location.pathname.startsWith('/daycare/')) {
        sessionStorage.setItem('daycare_return_url', window.location.pathname + window.location.search);
    }
}

export function popDaycareReturnUrl(): string {
    const url = sessionStorage.getItem('daycare_return_url') ?? '/map';
    sessionStorage.removeItem('daycare_return_url');
    return url;
}
