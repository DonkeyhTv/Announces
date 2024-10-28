# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and
some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md)
  uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)
  uses [SWC](https://swc.rs/) for Fast Refresh

## Utilisation du multilanguage avec lien dans un texte

```js
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>
        <Trans
          i18nKey="greeting"
          components={{ 1: <Link to="/profile" /> }} // utiliser un lien dans un texte "greeting": "Welcome to <1>{{firstname}}</1>, you're the best"
          values={{ firstname: "Steve" }}
        />
      </h1>
      <p>{t("welcome.line1")}</p>
      <span>{t("welcome.line2")}</span>
    </div>
  );
}
```

## Cryptage du mot de passe lors du Register Service

```
npm i bcrypt
npm i -D @types/bcrypt
```
