# GEØ — Dentro il problema

**Versione 0.10.5 — Beta**

GEØ è una web app open source per esercitarsi nella risoluzione di problemi di geometria piana nella scuola secondaria di primo grado.

L'app propone problemi organizzati per figura e strategia risolutiva, accompagnati da disegni dinamici e da un sistema di **scaffolding progressivo**. Gli aiuti vengono mostrati solo su richiesta e sono progettati per orientare il ragionamento senza anticipare la soluzione.

GEØ è sviluppato in **HTML, CSS e JavaScript vanilla**, senza framework. L'applicazione è prevalentemente client-side e può essere pubblicata come sito statico.

> **Stato del progetto:** GEØ è attualmente in fase beta. Funzionalità, struttura dei problemi, interfaccia e sistema di logging sono ancora in fase di test e possono subire modifiche.

## Funzionalità

- problemi di geometria generati a partire da diverse tipologie;
- organizzazione per figura e competenze coinvolte;
- disegni geometrici dinamici;
- aiuti progressivi;
- formulario integrato;
- generazione di problemi simili o di tipologia diversa;
- identificazione della sessione tramite nickname;
- logging delle interazioni per l'analisi didattica;
- interfaccia responsive;
- nessuna registrazione o account utente.

## Scaffolding

Gli aiuti sono organizzati in livelli progressivi e vengono aperti su richiesta dello studente.

Il principio di progettazione è semplice: **un aiuto deve suggerire dove guardare, non anticipare ciò che lo studente può ancora ricavare autonomamente**.

L'apertura di un aiuto chiude automaticamente quello precedente. Oltre a mantenere pulita l'interfaccia, questo permette di misurare in modo più significativo il tempo di consultazione dei singoli suggerimenti.

## Nickname e logging

All'avvio GEØ richiede un nickname. Il nickname non costituisce un account e non viene utilizzato come sistema di autenticazione: serve a collegare alla stessa sessione di lavoro gli eventi registrati dall'applicazione.

Il sistema di logging può registrare, tra le altre cose:

- argomento selezionato;
- problema aperto;
- navigazione tra problemi;
- ritorno alla home;
- aiuti consultati;
- durata della consultazione degli aiuti.

I dati possono essere inviati a un backend collegato a **Google Sheets**, permettendo al docente di analizzare il percorso seguito dagli studenti.

Il logging non produce automaticamente una valutazione: i dati raccolti sono destinati all'interpretazione da parte del docente.

## Architettura

La struttura principale del progetto è:

```text
/
├── index.html     # entry point
├── style.css      # interfaccia e responsive design
├── app.js         # logica dell'applicazione
├── README.md
└── LICENSE
```

`index.html` contiene il contenitore principale:

```html
<main id="app"></main>
```

L'interfaccia viene costruita dinamicamente da `app.js`, che gestisce la navigazione, i problemi, il rendering delle figure, gli aiuti e il logging.

Non sono richiesti framework JavaScript o un CMS.

## Esecuzione

GEØ può essere distribuito come sito statico.

Per una semplice installazione è sufficiente pubblicare i file del progetto mantenendone la struttura. Il browser carica `index.html`, che importa `style.css` e `app.js`.

La configurazione dell'eventuale backend di logging è separata dal funzionamento principale dell'app.

## Privacy

GEØ non richiede la creazione di account utente.

Se viene utilizzato il sistema di logging, chi distribuisce l'applicazione deve configurare opportunamente la raccolta dei dati e scegliere una modalità di utilizzo dei nickname coerente con il proprio contesto e con la normativa applicabile.

## Sviluppo

GEØ è ideato e curato da **Francesco Bussola**, docente di Matematica e Scienze nella scuola secondaria di primo grado.

Il progetto è stato sviluppato con un ampio utilizzo di strumenti di **intelligenza artificiale generativa come supporto alla programmazione**. Progettazione didattica, struttura dell'applicazione, criteri di scaffolding e revisione degli output sono stati curati dall'autore.

## Licenza

Il progetto è distribuito con **licenza MIT**.

Consulta [`LICENSE`](LICENSE) per i termini completi.

---

# GEØ — Inside the Problem

**Version 0.10.5 — Beta**

GEØ is an open-source web app designed to support the learning and practice of plane geometry problem solving in lower secondary education.

The app provides problems organized by geometric figure and problem-solving strategy, supported by dynamic diagrams and a system of **progressive scaffolding**. Hints are displayed only when requested and are designed to guide students' reasoning without revealing the solution prematurely.

GEØ is built with **HTML, CSS and vanilla JavaScript**, without frameworks. The application runs primarily client-side and can be deployed as a static website.

> **Project status:** GEØ is currently in beta. Features, problem structures, user interface and the logging system are still being tested and may change.

## Features

- geometry problems based on different problem types;
- organization by geometric figure and skills involved;
- dynamically generated geometric diagrams;
- progressive hints and scaffolding;
- integrated formula reference;
- generation of similar problems or problems of a different type;
- session identification through a nickname;
- interaction logging for educational analysis;
- responsive interface;
- no user registration or account required.

## Scaffolding

Hints are organized into progressive levels and are displayed only when requested by the student.

The main design principle is simple: **a hint should suggest where to look without revealing what the student can still discover independently**.

Opening a new hint automatically closes the previous one. Besides keeping the interface uncluttered, this makes the time spent consulting individual hints more meaningful for logging purposes.

## Nickname and logging

GEØ asks the user to enter a nickname when starting the application.

The nickname is not an account and is not used for authentication. Its purpose is to associate recorded events with the same working session.

The logging system can record information such as:

- selected topic or category;
- problem opened;
- navigation between problems;
- return to the home screen;
- hints consulted;
- time spent consulting hints.

These events can be sent to a backend connected to **Google Sheets**, allowing teachers to analyze the path followed by students while working on problems.

Logging does not automatically produce an assessment or grade. The collected data are intended to be interpreted by the teacher.

## Architecture

The core project structure is:

```text
/
├── index.html     # entry point
├── style.css      # UI and responsive design
├── app.js         # application logic
├── README.md
└── LICENSE
```

`index.html` provides the main application container:

```html
<main id="app"></main>
```

The interface is dynamically generated by `app.js`, which handles navigation, problems, diagram rendering, scaffolding and interaction logging.

No JavaScript framework or CMS is required.

## Running and deployment

GEØ can be deployed as a static website.

For a basic installation, the project files can be uploaded to any web server while preserving their directory structure. The browser loads `index.html`, which imports `style.css` and `app.js`.

Configuration of the optional logging backend is separate from the core application.

## Privacy

GEØ does not require users to create personal accounts.

When interaction logging is enabled, whoever deploys the application is responsible for configuring data collection appropriately and for defining a nickname policy suitable for their context and applicable data-protection requirements.

## Development

GEØ was conceived and is maintained by **Francesco Bussola**, a lower-secondary Mathematics and Science teacher.

The software has been developed with extensive use of **generative AI tools as programming assistants**. Educational design, application structure, scaffolding criteria and review of the generated outputs have been curated by the author.

## License

GEØ is released under the **MIT License**.

See [`LICENSE`](LICENSE) for the full license text.
