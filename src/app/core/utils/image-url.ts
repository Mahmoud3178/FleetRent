import { environment } from '../../../environments/environment';

/**
 * الباك إند بيرجع مسار نسبي زي "/uploads/cars/xxx.jpg"
 * الدالة دي بتضمه لرابط السيرفر الأساسي (بدون /api في الآخر)
 */
export function toFullImageUrl(relativeUrl: string | null | undefined): string | null {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) return relativeUrl; // لو أصلاً رابط كامل (Cloud storage مثلاً)
  const base = environment.apiUrl.replace(/\/api\/?$/, '');
  return `${base}${relativeUrl}`;
}
