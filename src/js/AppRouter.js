import Navigo from 'navigo';

export default class AppRouter {
  constructor(routes) {
    this.isFirstFetch = true;
    this.onNavigation = this.onNavigation.bind(this);
    this.onAnchorClick = this.onAnchorClick.bind(this);

    const root = null;
    this._router = new Navigo(root, false);
    this._routes = routes;

    this.setupInternalRoutes();
    this.setupAnchors();
  }

  onNavigation() {
    if (this.isFirstFetch) {
      this.isFirstFetch = false;
      return;
    }
    const path = window.location.pathname;
    fetch(path)
    .then(response => response.text())
    .then(content => {
      const newPageContent =
        (new DOMParser).parseFromString(content, 'text/html')
        .querySelector('#content');
      const currentPageContent = document.querySelector('#page-content');
      this.cleanupEventListeners();
      currentPageContent.innerHTML = '';
      currentPageContent.appendChild(newPageContent);
      this.setupAnchors();
    });
  }

  setupInternalRoutes() {
    const routesHandlers = {};
    this._routes.forEach((route) => {
      routesHandlers[route] = this.onNavigation;
    });

    this._router.on(this.onNavigation).resolve();
    this._router.on(routesHandlers).resolve();
  }

  onAnchorClick(e) {
    e.preventDefault();
    const destinyRoute = e.currentTarget.getAttribute('href');
    this._router.navigate(destinyRoute, true);
  }

  getInternalAnchors() {
    return document.querySelectorAll('a[href^="/"]');
  }

  cleanupEventListeners() {
    const anchors = this.getInternalAnchors();
    anchors.forEach((anchor) => {
      anchor.removeEventListener('click', this.onAnchorClick);
    });
  }

  setupAnchors() {
    const anchors = this.getInternalAnchors();
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', this.onAnchorClick);
    }) 
  }

  getInternalAnchors() {
    return document.querySelectorAll('a[href^="\/"]');
  }
}