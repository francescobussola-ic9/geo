# GEØ — Dentro il problema

**Versione 0.6.1 — Beta**

GEØ è una web app open source per esercitarsi nella risoluzione di problemi di geometria piana nella scuola secondaria di primo grado.

L'app propone problemi organizzati per figura e strategia risolutiva, accompagnati da disegni dinamici e da un sistema di **scaffolding progressivo**. Gli aiuti vengono mostrati solo su richiesta e sono progettati per orientare il ragionamento senza anticipare la soluzione.

GEØ è sviluppato in **HTML, CSS e JavaScript vanilla**, senza framework. L'applicazione è prevalentemente client-side e può essere pubblicata come sito statico.

> **Stato del progetto:** GEØ è attualmente in fase beta. Funzionalità, struttura dei problemi, interfaccia e sistema di logging sono ancora in fase di test e possono subire modifiche.

## Funzionalità

- problemi di geometria generati a partire da diverse tipologie;
- organizzazione per figura e competenze coinvolte;
- disegni geometrici dinamici;
- aiuti progressivi;
- formulario integrato e tavola numerica dinamica;
- generazione di problemi simili o di tipologia diversa;
- accesso libero agli esercizi senza registrazione;
- accesso tramite codice per abilitare nickname e logging;
- registrazione delle interazioni per l'analisi didattica;
- segnalazione degli errori integrata, riservata agli utenti autorizzati;
- interfaccia responsive.

## Scaffolding

Gli aiuti sono organizzati in livelli progressivi e vengono aperti su richiesta dello studente.

Il principio di progettazione è semplice: **un aiuto deve suggerire dove guardare, non anticipare ciò che lo studente può ancora ricavare autonomamente**.

L'apertura di un aiuto chiude automaticamente quello precedente. Questo mantiene ordinata l'interfaccia e permette di registrare la consultazione dei singoli suggerimenti. Le tracce di utilizzo non dimostrano, da sole, l'apprendimento o l'effettiva attenzione dello studente.

## Codici di accesso, nickname e logging

**GEØ rimane liberamente utilizzabile senza identificarsi.** Per abilitare il nickname e la registrazione delle attività è invece necessario inserire un codice di accesso valido fornito dall'autore nell'apposito riquadro della home. Dopo la verifica si può indicare il proprio nome o nickname.

I codici sono condivisibili e identificano una **categoria** (`Studente` o `Esterno`) e permettono di confiugurare un **gruppo** , non una specifica persona. Il nickname invece identifica un utente, ma non costituisce un account personale.

I codici vengono gestiti nella scheda `ACCESSI` del Google Foglio collegato al backend, con le colonne `Codice`, `Categoria`, `Gruppo` e `Attivo`. È possibile aggiungere o disattivare codici senza modificare il sito.

Il sistema di logging può registrare:

- argomento selezionato e problema aperto;
- navigazione tra problemi e ritorno alla home;
- aiuti consultati e relativa durata di apertura;
- identificativo di sessione, sequenza degli eventi, categoria e gruppo.

I dati vengono raccolti nella scheda `Log` di Google Sheets tramite un backend Google Apps Script. Il backend verifica le autorizzazioni prima di accettare gli eventi. Il logging non produce automaticamente una valutazione: i dati raccolti sono destinati all'interpretazione da parte del docente.

## Segnalazione degli errori

Nella schermata di un problema, **solo gli utenti che hanno verificato un codice di accesso valido** vedono il pulsante **«Segnala un errore»**. Gli utenti anonimi possono continuare a svolgere tutti gli esercizi, ma non vedono il pulsante.

Il pulsante apre un modulo interno a GEØ, senza avviare un programma di posta. L'utente seleziona il tipo di errore (`Testo o dati`, `Disegno`, `Aiuti` oppure `Altro`) e inserisce una descrizione.

Le segnalazioni vengono inviate tramite **Formspree** all'endpoint `https://formspree.io/f/xoejwdag`, con notifiche destinate all'alias `geoapp@duck.com`.

GEØ allega automaticamente alla segnalazione:

- tipo e descrizione dell'errore;
- identificativo della famiglia e figura geometrica;
- testo dell'esercizio;
- versione dell'app dichiarata nel modulo;
- URL della pagina.

**Non vengono allegati automaticamente nickname, codice di accesso o dati del log.**

### Protezioni e limiti

Il modulo comprende un campo *honeypot* e un'attesa di **60 secondi tra invii nella stessa sessione del browser**. Formspree applica inoltre i filtri antispam configurati nel relativo account. Queste misure non costituiscono un'autenticazione dell'endpoint: il suo URL è pubblico e può essere richiamato direttamente. Anche la visibilità condizionata del pulsante è un controllo dell'interfaccia, non una protezione server-side dell'endpoint Formspree.

L'invio AJAX attualmente utilizzato richiede una configurazione Formspree compatibile: nella configurazione testata, **reCAPTCHA è disattivato**. Per attivare un CAPTCHA occorre adeguare il codice del modulo e le impostazioni del servizio.

Per verificare il funzionamento, aprire un problema dopo l'accesso, inviare una segnalazione e controllare **Submissions** e **Spam** nella dashboard Formspree. Le segnalazioni classificate come spam potrebbero non generare una notifica email. Il servizio è soggetto ai limiti del piano Formspree utilizzato.

L'invio delle segnalazioni è indipendente dal backend Google Apps Script: per modificare soltanto il modulo Formspree non occorre aggiornare `server/Code.gs` né il relativo deployment.

## Architettura

La struttura principale del progetto comprende:

```text
/
├── index.html                 # versione online
├── app.js                     # avvio della versione online
├── style.css                  # interfaccia e responsive design
├── src/
│   ├── main.js               # inizializzazione
│   ├── domain/               # catalogo e famiglie di problemi
│   ├── ui/app-ui.js          # interfaccia, aiuti e segnalazioni
│   └── services/             # accesso e telemetria
├── server/Code.gs            # backend Google Apps Script
├── README.md
└── LICENSE
```

`index.html` contiene il contenitore principale `<main id="app"></main>`. L'interfaccia viene costruita dinamicamente dai moduli JavaScript. Non sono richiesti framework JavaScript o un CMS.

## Esecuzione e distribuzione

L'app può essere pubblicata come sito statico, per esempio tramite GitHub Pages, mantenendo la struttura dei file. I problemi sono accessibili anche senza configurare il backend di logging.

Per abilitare l'accesso con codice e il logging occorre configurare il Google Foglio con le schede `ACCESSI` e `Log`, pubblicare `server/Code.gs` come applicazione web Google Apps Script e configurare una proprietà dello script privata denominata `SCRIPT_SECRET`. **Il valore di questa proprietà non deve essere pubblicato nel repository.** L'URL del deployment va configurato nel servizio di telemetria del frontend.

La verifica dei codici nella versione online utilizza una richiesta compatibile con GitHub Pages e Apps Script; i codici condivisi non devono essere considerati password personali. Il backend deve mantenere la verifica server-side degli eventi registrati.

## Privacy

GEØ non richiede account personali e consente l'uso anonimo degli esercizi. L'inserimento del codice abilita funzioni aggiuntive, tra cui la registrazione delle attività. Chi distribuisce l'applicazione deve configurare la raccolta dei dati, la conservazione e l'informativa in modo coerente con il contesto scolastico e la normativa applicabile.

Le segnalazioni vengono gestite da un servizio esterno, Formspree; il modulo non allega automaticamente dati identificativi dell'utente, ma la descrizione scritta liberamente potrebbe contenerne. È opportuno evitare l'inserimento di dati personali nelle segnalazioni.

## Sviluppo

GEØ è ideato e curato da **Francesco Bussola**, docente di Matematica e Scienze nella scuola secondaria di primo grado.

Il progetto è stato sviluppato con un ampio utilizzo di strumenti di **intelligenza artificiale generativa come supporto alla programmazione**. Progettazione didattica, struttura dell'applicazione, criteri di scaffolding e revisione degli output sono stati curati dall'autore.

## Licenza

Il codice sorgente di GEØ è distribuito con licenza MIT. Per i dettagli, consulta il file [LICENSE](LICENSE).

### Nome e identità del progetto

La licenza MIT si applica esclusivamente al codice sorgente. Il nome GEØ, il logo, l'identità visiva e gli elementi di branding associati non sono concessi in licenza ai sensi della MIT License. Il loro eventuale utilizzo in progetti derivati non implica approvazione o affiliazione con il progetto GEØ originale.

© 2026 Francesco Bussola

---

# GEØ — Inside the Problem

**Version 0.6.1 — Beta**

GEØ is an open-source web app designed to support plane geometry problem solving in lower secondary education.

Problems are organized by geometric figure and solving strategy, with dynamic diagrams and **progressive scaffolding**. Hints appear only on request and aim to guide reasoning without prematurely revealing solutions.

GEØ is built with **HTML, CSS and vanilla JavaScript**, without frameworks. It runs primarily client-side and can be deployed as a static website.

> **Project status:** GEØ is in beta. Features, problem structures, interface and logging may change.

## Features

- geometry problems generated from multiple problem types;
- organization by figure and skills;
- dynamic geometric diagrams and progressive hints;
- integrated formula reference and dynamic numeric table;
- generation of similar or different problems;
- unrestricted anonymous access to exercises;
- access codes enabling nicknames and interaction logging;
- integrated error reporting for authorized users;
- responsive interface.

## Scaffolding

Hints are organized in progressive levels and opened on request. **A hint should suggest where to look without revealing what the student can still discover independently.** Opening one hint closes the previous one. Recorded hint usage is a behavioral trace, not proof of attention or learning.

## Access codes, nicknames and logging

**All exercises remain available without signing in.** Users who want to enable a nickname and activity logging enter a valid access code on the home screen, then provide a name or nickname.

Codes identify a configurable **category** (`Studente` or `Esterno`) and allow to configure a specific **group**, not a particular individual. A nickname identifies a single user, but it is not a personal account.

Codes are managed in the `ACCESSI` tab of the connected Google spreadsheet, with columns `Codice`, `Categoria`, `Gruppo` and `Attivo`. Codes can be added or disabled without editing the website.

The logging system can record selected topics, opened problems, navigation, returns to the home screen, consulted hints and their open duration, session and event sequence identifiers, category and group. Events are sent to the `Log` sheet through a Google Apps Script backend that validates authorization before accepting them.

Logging does not automatically assess or grade students. Records are intended for interpretation by teachers.

## Error reporting

On problem pages, **only users who have verified a valid access code** see the **“Segnala un errore” (Report an error)** button. Anonymous users retain full access to the exercises but do not see this button.

The button opens an in-app form. Users select a category (`Testo o dati`, `Disegno`, `Aiuti`, or `Altro`) and describe the issue without opening an email client.

Reports are sent to **Formspree**, endpoint `https://formspree.io/f/xoejwdag`, with email notifications directed to the alias `geoapp@duck.com`.

The form automatically includes the report type and description, problem family and figure identifiers, exercise text, the app version declared by the form, and the page URL. **Nicknames, access codes and activity logs are not automatically included.**

### Anti-spam measures and limitations

The form includes a *honeypot* field and a **60-second interval between submissions within the same browser session**. Formspree may apply additional spam filtering according to account settings. These client-side measures do not secure the public Formspree endpoint against direct requests. Hiding the button is a user-interface restriction, not server-side authorization of Formspree submissions.

The current AJAX integration requires compatible Formspree settings; in the tested setup, **reCAPTCHA is disabled**. Enabling a CAPTCHA requires corresponding changes to the form implementation and service settings.

To test reporting, open a problem after access-code verification, submit a report, and check both **Submissions** and **Spam** in the Formspree dashboard. Spam-classified reports may not trigger email notifications. Usage is subject to the chosen Formspree plan limits.

Error reporting is separate from Google Apps Script logging: changes to the Formspree form alone do not require editing or redeploying `server/Code.gs`.

## Architecture

The main project structure is:

```text
/
├── index.html                 # online entry point
├── app.js                     # online bootstrap
├── style.css                  # UI and responsive design
├── src/
│   ├── main.js               # initialization
│   ├── domain/               # problem catalog and families
│   ├── ui/app-ui.js          # interface, hints and reporting
│   └── services/             # access and telemetry
├── server/Code.gs            # Google Apps Script backend
├── README.md
└── LICENSE
```

`index.html` contains `<main id="app"></main>`. The interface is generated dynamically by JavaScript modules. No JavaScript framework or CMS is required.

## Running and deployment

The app can be deployed as a static site, for example on GitHub Pages, while preserving the directory structure. Geometry exercises remain available even when logging is not configured.

To enable access-code verification and logging, configure the `ACCESSI` and `Log` sheets, deploy `server/Code.gs` as a Google Apps Script web app, and set a private script property named `SCRIPT_SECRET`. **Never commit its value to the public repository.** Configure the deployment URL in the frontend telemetry service.

Online code verification uses a mechanism compatible with GitHub Pages and Apps Script. Shared codes should not be treated as personal passwords. Logged events must still be validated server-side.

## Privacy

GEØ does not require personal accounts and allows anonymous use of exercises. Access codes enable additional features, including activity logging. Deployers are responsible for appropriate data collection, retention, notices and compliance with applicable data-protection requirements.

Error reports are handled by the external service Formspree. The form does not automatically include user-identifying information, but users may enter personal data in free-text descriptions; they should be encouraged not to do so.

## Development

GEØ was conceived and is maintained by **Francesco Bussola**, a lower-secondary Mathematics and Science teacher.

The software has been developed with extensive use of **generative AI tools as programming assistants**. Educational design, application structure, scaffolding criteria and review of generated outputs have been curated by the author.

## License

The source code of GEØ is released under the MIT License. See [LICENSE](LICENSE).

### Name and branding

The MIT License applies only to source code. The GEØ name, logo, visual identity and associated branding are not licensed under the MIT License. Their use in derivative projects does not imply endorsement by or affiliation with the original GEØ project.

© 2026 Francesco Bussola
