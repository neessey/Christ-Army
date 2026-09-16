# Christ Army — Dashboards & Firestore

## Ce qui a été corrigé

- Le chargement global ne lit plus `enrolements` avant l'authentification.
- Les statistiques Admin et Leader viennent de Firestore.
- Les membres du Leader viennent de `users`.
- Les départements des dashboards viennent de `departments`.
- Le Manager récupère son département depuis Firestore.
- Les inscriptions de département, les inscriptions d'événements, les dons et les présences restent synchronisés avec Firestore.
- Les départements manquants sont initialisés automatiquement depuis `mockData.ts` lorsqu'un administrateur ouvre l'application. Les documents déjà présents ne sont pas écrasés.
- Les règles empêchent désormais un membre de s'auto-promouvoir en `admin`, `leader` ou `manager`.
- Le fichier de compte de service Firebase qui se trouvait dans `public/` a été retiré de cette archive.

## Collections utilisées

- `users`
- `departments`
- `enrolements`
- `inscriptions_departements`
- `inscriptions_evenements`
- `donations`
- `attendance_sessions`
- `global_stats`
- `external_registrations`

## Important

Déployer le fichier `firestore.rules` dans Firebase Console avant de tester les dashboards.

Firebase Console → Firestore Database → Rules → remplacer les règles actuelles par `firestore.rules` → Publish.

Le compte qui ouvre le Cockpit Admin doit avoir un document `users/{uid}` avec `role: "admin"`.

Le compte Leader doit avoir `role: "leader"`.

Le compte Responsable doit avoir :
- `role: "manager"`
- `managedDepartmentId: "<id du département>"`

Les départements utilisent les IDs présents dans `mockData.ts` lors de la première initialisation.

## Sécurité

Un ancien fichier de compte de service Firebase était présent dans `public/`. Il ne doit jamais être publié côté navigateur. Il a été retiré de cette version du projet.

Si ce fichier a déjà été envoyé sur GitHub, déployé ou partagé, il faut révoquer/faire tourner la clé du compte de service concerné dans Google Cloud/Firebase et ne jamais remettre cette clé dans `public/`.
