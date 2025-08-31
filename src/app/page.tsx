"use client";

import Head from "next/head";
import {useRef, useState, useEffect} from "react";
import ReCAPTCHA from "react-google-recaptcha"


/**
 * The Home component provides an interactive interface for users to participate in a voting system related to IT sector salaries.
 * It involves functionality for retrieving, displaying, and filtering salary-related data based on user input.
 * The component uses React state management to handle dynamic changes and user interactions.
 *
 * @return {React.ReactElement} Returns the JSX structure of the Home component, which contains input fields,
 * voting rules, salary statistics, and user interactive functionality.
 */
export default function Home() {

    const [voted, setVoted] = useState(false)
    let [salary, setSalary] = useState("")
    const [data, setData] = useState<Item[]>([])
    const [votes, setVotes] = useState(0)
    const reRef = useRef<ReCAPTCHA>(null)
    const [runFetch, setRunFetch] = useState(false)
    const [year, setYear] = useState(2025)
    const [month, setMonth] = useState(9)
    const [level, setLevel] = useState("")
    const [position, setPosition] = useState("")

    //FILTERS
    const [positions, setPositions] = useState<Positions[]>([])
    const [filterPosition, setFilterPosition] = useState<string[]>([])

    const [levels, setLevels] = useState<Levels[]>([])
    const [filterLevel, setFilterLevel] = useState<string[]>([])



    // Ez csak kliens oldalon fut
    useEffect(() => {
        const stored = localStorage.getItem("vote202508") === "true"
        setVoted(stored)
    }, [])

    type Item = {
        id: number;
        salary: string;
        position: string;
        level: string;
        time?: string;
    };
    type Levels = {
        level: string;
        count: number;
    }
    type Positions = {
        position: string;
        count: number;
    }

    type ResponseData = {
        levels: Levels[];
        positions: Positions[];
        items: Item[];
    };

    if (voted && salary) {
        const votedName = localStorage.getItem('vote202508Name')
        if (salary === "" && votedName) salary = votedName
    }


    useEffect(() => {
        if (!voted) return

        let interval: ReturnType<typeof setInterval>;

        const getFetchData = async () => {
            try {
                const query = new URLSearchParams({
                    ...(filterLevel.length ? {level: filterLevel.join(",")} : {}),
                    ...(filterPosition.length ? {position: filterPosition.join(",")} : {})
                })

                const response = await fetch(`https://berfigyelo.vercel.app/api/${year}/${month}?${query}`)
                if (response.ok) {
                    const jsonData: ResponseData = await response.json()
                    setData(jsonData.items)
                    setVotes(jsonData.items.length)
                    setLevels(jsonData.levels)
                    setPositions(jsonData.positions)
                } else {
                    console.error("Hiba a szerverről:", response.status)
                }
            } catch (error) {
                console.error('Hiba történt a küldés során:', error)
            }
        };

        getFetchData();

        // 10 másodperces polling
        interval = setInterval(getFetchData, 10000);

        return () => clearInterval(interval); // cleanup
    }, [voted, year, month, filterLevel, filterPosition]);


    async function fetchData() {
        if (runFetch) return
        if (salary === "" || level === "" || position === "") return alert("Adj meg minden adatot!")
        setRunFetch(true)

        // ReCAPTCHA
        const token = await reRef.current?.executeAsync()
        reRef.current?.reset()


        try {
            const response = await fetch('https://berfigyelo.vercel.app/api/create9', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({salary, position, level, token})
            })

            if (response.ok) {
                localStorage.setItem('vote202509', 'true')
                localStorage.setItem('vote202509Name', `${salary}`)
                console.log(response.ok)
                const jsonData: ResponseData = await response.json()
                setData(jsonData.items)
                console.log(data)
                setVoted(true)
                setLevels(jsonData.levels)
                setPositions(jsonData.positions)
            } else {
                console.error("Hiba a szerverről:", response.status);
            }
            //console.log(data)
        } catch (error) {
            console.error('Hiba történt a küldés során:', error);
        }
        setRunFetch(false)

    }

    function showRules() {
        document.querySelector('.rules ol')?.classList.toggle('active')
    }

    function Levels(e: React.ChangeEvent<HTMLInputElement>) {
        const {checked, value} = e.target
        e.target.previousElementSibling?.classList.toggle('checked')

        setFilterLevel((prev) => {
            if (checked) return [...prev, value]
            else return prev.filter((item) => item !== value)
        })
    }

    function Positions(e: React.ChangeEvent<HTMLInputElement>) {
        const {checked, value} = e.target
        e.target.previousElementSibling?.classList.toggle('checked')

        setFilterPosition((prev) => {
            if (checked) return [...prev, value]
            else return prev.filter((item) => item !== value)
        })
    }


    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:wght@100..800&display=swap"
                    rel="stylesheet"/>

            </Head>

            <section>

                <div className="title">
                    <div className="version">v0.15</div>
                    <h1>Nézd meg mennyit keresnek mások az <span style={{color: '#154ee0'}}>IT szektorban</span></h1>
                </div>

                <div className="subtitle">Ha az IT-ban dolgozol, add meg a havi <span style={{color: '#154ee0'}}>bruttó fizetésed,</span> hogy
                    megnézhesd mások fizetését.
                </div>

                <div className="rules">
                    <button type="button" onClick={showRules}>Olvasd el a szavazás feltételeit</button>
                    <ol>
                        <li>Csak akkor szavazz, ha jelenleg az IT-ban dolgozol!</li>
                        <li>Csak akkor szavazz, ha Magyarországon élsz!</li>
                        <li>Ha vállalkozó vagy, akkor az elmúlt 6 hónap bruttó bevételed átlagold!</li>
                        <li>Ha egyéb pénzbeli juttatást is kapsz, akkor átlagold! Pl. évi 120.000 Ft prémium az havi
                            10.000 Ft.
                        </li>
                        <li>Ha 13. vagy 14. havi fizetést is kapsz, akkor átlagold 12 hónapra!</li>
                    </ol>
                </div>


                {voted === false ?
                    <div className="input">
                        <div className="select-icon">
                            <select onChange={(e) => setSalary(e.target.value)}>
                                <option value="">Bruttó fizetésed</option>
                                <option value="Nem dolgozom az IT-ban">Nem dolgozom az IT-ban</option>
                                <option value="IT-s vagyok, de most nincs IT munkám">IT-s vagyok, de most nincs IT
                                    munkám
                                </option>
                                <option value="Külföldön élek, ezért nem szavazhatok">Külföldön élek, ezért nem
                                    szavazhatok
                                </option>
                                {
                                    Array.from({length: 60}, (_, i) => i * 100000).map(i =>
                                        <option key={i + 1}
                                                value={`${new Intl.NumberFormat('de', {useGrouping: true}).format(i + 1)} - ${new Intl.NumberFormat('de', {useGrouping: true}).format(i + 100000)} Ft`}>
                                            {`${new Intl.NumberFormat('de', {useGrouping: true}).format(i + 1)} - ${new Intl.NumberFormat('de', {useGrouping: true}).format(i + 100000)} Ft`}
                                        </option>
                                    )
                                }
                            </select>
                        </div>
                        <div className="select-icon">
                            <select onChange={(e) => setLevel(e.target.value)}>
                                <option value="">Szinted</option>
                                <option value="Intern">Intern</option>
                                <option value="Junior">Junior</option>
                                <option value="Medior">Medior</option>
                                <option value="Senior">Senior</option>
                                <option value="Lead">Lead</option>
                                <option value="Staff">Staff</option>
                                <option value="Architech">Architech</option>
                                <option value="Principal">Principal</option>
                            </select>
                        </div>
                        <div className="select-icon">
                            <select onChange={(e) => setPosition(e.target.value)}>
                                <option value="">Pozíciód</option>

                                <optgroup label="Fejlesztés & Szoftver">
                                    <option value="Software Engineer">Software Engineer</option>
                                    <option value="Frontend Developer">Frontend Developer</option>
                                    <option value="Backend Developer">Backend Developer</option>
                                    <option value="Fullstack Developer">Fullstack Developer</option>
                                    <option value="Mobile Developer">Mobile Developer</option>
                                    <option value="DevOps Engineer">DevOps Engineer</option>
                                    <option value="QA / Test Engineer">QA / Test Engineer</option>
                                    <option value="Automation Test Engineer">Automation Test Engineer</option>
                                </optgroup>

                                <optgroup label="Infrastruktúra & Rendszerek">
                                    <option value="System Administrator">System Administrator</option>
                                    <option value="Network Engineer">Network Engineer</option>
                                    <option value="IT Support / Helpdesk">IT Support / Helpdesk</option>
                                    <option value="Cloud Engineer">Cloud Engineer</option>
                                    <option value="Database Administrator">Database Administrator</option>
                                </optgroup>

                                <optgroup label="Kiberbiztonság">
                                    <option value="Security Analyst">Security Analyst</option>
                                    <option value="Security Engineer">Security Engineer</option>
                                    <option value="Ethical Hacker">Ethical Hacker</option>
                                </optgroup>

                                <optgroup label="Adat & AI">
                                    <option value="Data Analyst">Data Analyst</option>
                                    <option value="Data Scientist">Data Scientist</option>
                                    <option value="Data Engineer">Data Engineer</option>
                                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                                    <option value="BI Developer">BI Developer</option>
                                </optgroup>

                                <optgroup label="UI/UX & Termék">
                                    <option value="UX/UI Designer">UX/UI Designer</option>
                                    <option value="Product Designer">Product Designer</option>
                                    <option value="UX Researcher">UX Researcher</option>
                                    <option value="Product Owner">Product Owner</option>
                                    <option value="Product Manager">Product Manager</option>
                                    <option value="Business Analyst">Business Analyst</option>
                                </optgroup>

                                <optgroup label="Projekt & Vezetés">
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Scrum Master">Scrum Master</option>
                                </optgroup>
                            </select>
                        </div>
                        <button type="button" disabled={voted} onClick={fetchData}>{runFetch ? <img className="runFetch" src="loading.svg"/> : "Beküldés"}</button>
                        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""} size="invisible"
                                   ref={reRef}/>
                    </div>
                    : null}

                {voted ?
                    <div className="votes-block">
                        <div className="filter-date">
                            <div className="year">
                                <div className="select-icon">
                                    <select onChange={(e) => setYear(Number(e.target.value))}>
                                        <option value="2025">2025</option>
                                    </select>
                                </div>
                            </div>

                            <div className="month">
                                <div className="select-icon">
                                    <select onChange={(e) => setMonth(Number(e.target.value))}>
                                        <option value="8">Augusztus</option>
                                        <option value="9">Szeptember</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="votes-details">
                            <div className="allVotes">Szavazatok: {votes}</div>
                            <div className="close">Szavazás vége: 2025.08.31.</div>
                        </div>

                        <div className="votes">
                            <div className="filters">

                                <div className="filter">
                                    <div className="filter-title">Szint</div>
                                    <div className="filter-options">
                                        <div className="filter-options-padding">
                                            {levels.map(level => (
                                                <label key={level.level}>
                                                    <div className="checkbox"></div>
                                                    <input type="checkbox" value={level.level} className="filter-level"
                                                           onChange={Levels}/>
                                                    <span className="filter-name">{level.level}</span>
                                                    <span className="filter-count">({level.count})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="filter">
                                    <div className="filter-title">Pozíció</div>
                                    <div className="filter-options">
                                        <div className="filter-options-padding">
                                            {positions.map(position => (
                                                <label key={position.position}>
                                                    <div className="checkbox"></div>
                                                    <input type="checkbox" value={position.position} className="filter-level"
                                                           onChange={Positions}/>
                                                    <span className="filter-name">{position.position}</span>
                                                    <span className="filter-count">({position.count})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <ul>
                                {
                                    Array.from({length: 60}, (_, i) => i * 100000).map(i => {
                                        const rangeLabel = `${new Intl.NumberFormat('de', {useGrouping: true}).format(i + 1)} - ${new Intl.NumberFormat('de', {useGrouping: true}).format(i + 100000)} Ft`;

                                        const count = data?.filter(item => item.salary === rangeLabel).length || 0;

                                        return (
                                            <li key={i + 1}>
                                                <div className="bar"
                                                     style={{width: `${(600 > window.innerWidth ? 300 : 600) * (count / votes)}px`}}>
                                                    <span className="voteNumber">{count}</span>
                                                    <span className="voteName">{rangeLabel}</span>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>

                        </div>
                    </div>
                    : null}

            </section>
        </>
    )
}
