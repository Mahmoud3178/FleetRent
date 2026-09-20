import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, CreateUserDto, LoginDto } from '../models/auth.models';
import { UserRole } from '../models/enums';

const TOKEN_KEY = 'fleetrent_token';
const ROLE_KEY = 'fleetrent_role';
const NAME_KEY = 'fleetrent_name';
const USERID_KEY = 'fleetrent_userid';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  // Signals تعكس حالة تسجيل الدخول في كل التطبيق فورًا
  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _role = signal<UserRole | null>(localStorage.getItem(ROLE_KEY) as UserRole | null);
  private _name = signal<string | null>(localStorage.getItem(NAME_KEY));
  private _userId = signal<number | null>(
    localStorage.getItem(USERID_KEY) ? Number(localStorage.getItem(USERID_KEY)) : null
  );

  isLoggedIn = computed(() => !!this._token());
  role = computed(() => this._role());
  name = computed(() => this._name());
  userId = computed(() => this._userId());

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, dto).pipe(
      tap((res) => this.setSession(res))
    );
  }

  register(dto: CreateUserDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, dto);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(ROLE_KEY, res.role);
    localStorage.setItem(NAME_KEY, res.name);
    localStorage.setItem(USERID_KEY, String(res.userId));
    this._token.set(res.token);
    this._role.set(res.role);
    this._name.set(res.name);
    this._userId.set(res.userId);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(USERID_KEY);
    this._token.set(null);
    this._role.set(null);
    this._name.set(null);
    this._userId.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(...roles: UserRole[]): boolean {
    const r = this._role();
    return !!r && roles.includes(r);
  }
}
