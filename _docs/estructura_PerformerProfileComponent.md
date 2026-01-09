# Estructura de archivos - PerformerProfile Component

Documentación de todos los archivos relacionados con `PerformerProfile.tsx` y sus dependencias para replicación en otros proyectos.

## Tabla de archivos relacionados

| Nombre (componente / código) | Ruta absoluta | Tipo | Descripción corta |
|---|---|---|---|
| `PerformerProfile` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performers/PerformerProfile.tsx` | Componente | Modal contenedor que muestra las pestañas de gestión de perfil. |
| `ProfileTab` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performerProfile/ProfileTab.tsx` | Componente | Formulario para editar datos del PerformerProfile (edad, medidas, enlaces, país). |
| `LikeTab` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performerProfile/LikeTab.tsx` | Componente | Gestiona preferencias "I like" y campos cortos del perfil (tags, showDescription). |
| `PricingTab` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performerProfile/PricingTab.tsx` | Componente | Ajuste de precios por producto del performer; sliders y confirmaciones. |
| `MediaProfileTab` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performerProfile/MediaProfileTab.tsx` | Componente | Administra assets (imágenes/videos), asigna avatar/video al perfil. |
| `PaymentsTab` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performerProfile/PaymentsTab.tsx` | Componente | Vista de resumen de pagos (earnings, métodos, transacciones). |
| `SalesTab` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performerProfile/SalesTab.tsx` | Componente | Analytics de ventas: resumen, por producto, top customers. |
| `PersonalInformationTab` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/performerProfile/PersonalInformationTab.tsx` | Componente | Formulario simple para nickname, headline y "myLive". |
| `CountrySelector` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/components/ui/CountrySelector.tsx` | Componente (UI) | Selector de país (ISO + emoji bandera) usado en ProfileTab. |
| `LikeService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/like.service.ts` | Service | Mock para obtener/actualizar preferencias y opciones de favoritos. |
| `PerformerProfileService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/performerProfile.service.ts` | Service | GET/PATCH del perfil (`/api/performers/{id}/profile`). |
| `ProductService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/products.service.ts` | Service | Gestión de productos y precios; `getPerformerProductByPerformerId`, `setPerformerProduct`. |
| `ContentService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/content.service.ts` | Service (funcs) | Obtiene assets por performerProfileId y los mapea a ContentItem. |
| `PerformersService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/performers.service.ts` | Service | Obtener/actualizar performer y `assignProfileAsset`. |
| `PaymentsService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/payments.service.ts` | Service | Mock de resumen y transacciones de pagos. |
| `SalesService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/sales.service.ts` | Service | Mock de resumen y métricas de ventas. |
| `GeodataService` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/geodata.service.ts` | Service | Provee lista de países y normalización (usado por CountrySelector). |
| `ApiClient` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/services/api/axios/apiClient.ts` | Util / Cliente HTTP | Instancia axios con interceptors para auth (usado por los servicios). |
| `Performer` / `PerformerProfile` (types) | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/types/performers.types.ts` | Types / Interfaces | Tipos centrales: Performer, PerformerProfile, DTOs y utilitarios. |
| `Product` / `PerformerProduct` (types) | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/app/types/products.types.ts` | Types | Tipos para productos y PerformerProduct (precio, min/max, etc.). |
| `ContentItem` (type) | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/types/content.ts` | Types | Tipo para assets/media mapeados (photo/video, status, price). |
| `profile.enums` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/performers/enums/profile.enums.ts` | Enums | Enums para ZodiacType, HairColorType, EyeColorType, EthnicityType, etc. |
| `LikeTab.test.tsx` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/tests/unit/performerProfile/LikeTab.test.tsx` | Test (unit) | Tests que ejemplifican uso de LikeService y PerformerProfileService. |
| `PersonalInformationTab.test.tsx` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/tests/unit/performerProfile/PersonalInformationTab.test.tsx` | Test (unit) | Pruebas del guardado y carga de información personal. |
| `PerformerProfile.pricing.test.tsx` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/tests/unit/PerformerProfile.pricing.test.tsx` | Test (unit) | Tests relacionados con lógica de PricingTab. |
| `CountrySelector.test.tsx` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/src/tests/unit/CountrySelector.test.tsx` | Test (unit) | Test para el selector de países. |
| `test-performer-profile.sh` | `/home/lgabrielcor/charmss/LineaBase/administrador-charmss/scripts/test-performer-profile.sh` | Script | Script para ejecutar los tests unitarios de performerProfile. |

## Notas para replicación

### Dependencias críticas para copiar:
1. **apiClient** - Configuración de axios y variables de entorno (`VITE_API_URL`)
2. **Types/Enums** - `performers.types.ts` y `profile.enums.ts` 
3. **Servicios base** - Aunque sean mocks, mantener la estructura para que las UI funcionen

### Flujo de datos:
- `PerformerProfile.tsx` → Recibe `Performer` y gestiona tabs
- Cada tab → Usa servicios específicos y tipos compartidos
- `CountrySelector` → Componente UI reutilizable con `GeodataService`

### Tests incluidos:
- Unit tests para validar lógica de cada tab
- Script de ejecución para CI/CD

---
*Generado automáticamente el 5 de enero de 2026*