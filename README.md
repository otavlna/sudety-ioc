# Sudety IoC

Jedná se o experiment implementace primitivního IoC kontejneru.

Má to svý mouchy. Má-li být provider typu TRANSIENT, měly by všechny parent providery být také transient. V této implementaci je však nutno ve všech parent providerech nastavit TRANSIENT ručně.

## Spuštění

```bash
ts-node --esm index.ts
```