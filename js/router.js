/**
 * Roteador baseado em hash (#/dashboard, #/species, #/lab, etc.) compatível com servidor estático.
 */
import { state, emit, persistSoon } from './state.js';

const VALID_ROUTES = new Set(['/dashboard', '/species', '/lab', '/study', '/compare', '/progress', '/library']);

export function parseHash(hashStr = window.location.hash) {
  const clean = (hashStr || '#/dashboard').replace(/^#/, '');
  const [rawPath, queryStr] = clean.split('?');
  const path = VALID_ROUTES.has(rawPath) ? rawPath : '/dashboard';
  const params = {};
  if (queryStr) {
    const usp = new URLSearchParams(queryStr);
    for (const [k, v] of usp.entries()) params[k] = v;
  }
  return { path, params };
}

export function navigate(path, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const target = `#${path}${qs.toString() ? `?${qs.toString()}` : ''}`;
  if (window.location.hash === target) {
    handleRouteChange();
  } else {
    window.location.hash = target;
  }
}

export function handleRouteChange() {
  const { path, params } = parseHash();
  state.route = path;
  state.routeParams = params;
  if (params.species) {
    state.currentSpecies = params.species;
    state.persisted.lastSession.species = params.species;
  }
  if (params.bone) {
    state.selectedBoneId = params.bone;
    state.persisted.lastSession.boneId = params.bone;
  }
  state.persisted.lastSession.route = path;
  persistSoon();
  emit('route:changed', { path, params });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
  if (!window.location.hash) {
    window.location.replace('#/dashboard');
  }
  handleRouteChange();
}
