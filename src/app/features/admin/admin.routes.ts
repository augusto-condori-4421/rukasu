import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AdminLayoutComponent } from './pages/layout/admin-layout.component';
import { LoginComponent } from './pages/login/login.component';

export const adminRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canMatch: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products/products.component').then(m => m.AdminProductsComponent),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./components/product-form/product-form.component').then(m => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./components/product-form/product-form.component').then(m => m.ProductFormComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.component').then(m => m.AdminCategoriesComponent),
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./components/category-form/category-form.component').then(m => m.CategoryFormComponent),
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('./components/category-form/category-form.component').then(m => m.CategoryFormComponent),
      },
    ],
  },
];
