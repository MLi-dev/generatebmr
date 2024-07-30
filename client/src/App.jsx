import { useState, useEffect } from "react";
import "./App.css";
import GenerateFormInput from "./components/GenerateFormInput";
import determineFormatType from "./utils/determineFormatType";
import GeneratedTable from "./components/GeneratedTable";
import GenerateFileInput from "./components/GenerateFileInput";
import { generateDataConfig } from "./utils/generateDataConfig";
import LoadingModal from "./components/LoadingModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

const App = () => {
	const [inputs, setInputs] = useState({
		eidr_id: "",
	});
	const API_URL =
		process.env.NODE_ENV === "production"
			? "https://bmrtemplate-production.up.railway.app"
			: "http://localhost:3001";

	const [searchType, setSearchType] = useState("");
	const [editEIDRList, setEditEIDRList] = useState([]);
	const [eidrErrorList, setEidrErrorList] = useState([]);
	const [nonEpisodicList, setNonEpisodicList] = useState([]);
	const [episodicList, setEpisodicList] = useState([]);
	const [unknownList, setUnknownList] = useState([]);
	const [editXML, setEditXML] = useState([]);
	const [episodicXML, setEpisodicXML] = useState([]);
	const [nonEpisodicXML, setNonEpisodicXML] = useState([]);
	const [unknownXML, setUnknownXML] = useState([]);
	const [hasEditFormat, setHasEditFormat] = useState(false);
	const [hasEpisodic, setHasEpisodic] = useState(false);
	const [hasNonEpisodic, setHasNonEpisodic] = useState(false);
	const [hasUnknown, setHasUnknown] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [dataConfig, setDataConfig] = useState({ sections: [] });
	const [selectedOption, setSelectedOption] = useState("");

	useEffect(() => {
		setDataConfig(
			generateDataConfig(
				episodicList,
				hasEpisodic,
				episodicXML,
				nonEpisodicList,
				hasNonEpisodic,
				nonEpisodicXML,
				editEIDRList,
				hasEditFormat,
				editXML,
				unknownList,
				hasUnknown,
				unknownXML,
				eidrErrorList
			)
		);
	}, [
		episodicList,
		hasEpisodic,
		episodicXML,
		nonEpisodicList,
		hasNonEpisodic,
		nonEpisodicXML,
		editEIDRList,
		hasEditFormat,
		editXML,
		unknownList,
		hasUnknown,
		unknownXML,
		eidrErrorList,
	]);

	const handleLoading = (bool) => {
		setLoading(bool);
	};
	const handleFormChange = () => {
		setIsForm((prev) => !prev);
	};
	const handleOptionChange = (event) => {
		setEpisodicList([]);
		setHasEpisodic(false);
		setEpisodicXML([]);
		setNonEpisodicList([]);
		setHasNonEpisodic(false);
		setNonEpisodicXML([]);
		setEditEIDRList([]);
		setHasEditFormat(false);
		setEditXML([]);
		setUnknownList([]);
		setHasUnknown(false);
		setUnknownXML([]);
		setEidrErrorList([]);
		setSelectedOption(event.target.value);
	};

	const callAPI = async (query, requestOptions, eidr_id) => {
		const response = await fetch(query, requestOptions);
		const text = await response.text(); // Changed from json() to text() to handle XML
		const parser = new DOMParser();
		const xmlDoc = await parser.parseFromString(text, "application/xml");
		const formatType = determineFormatType(xmlDoc);
		if (formatType === "Edit") {
			setEditXML((prev) => [...prev, xmlDoc]);
			setHasEditFormat(true);
			setEditEIDRList((prev) => [...prev, eidr_id]);
		} else if (formatType === "Episodic") {
			setEpisodicXML((prev) => [...prev, xmlDoc]);
			setHasEpisodic(true);
			setEpisodicList((prev) => [...prev, eidr_id]);
		} else if (formatType === "NonEpisodic") {
			setNonEpisodicXML((prev) => [...prev, xmlDoc]);
			setHasNonEpisodic(true);
			setNonEpisodicList((prev) => [...prev, eidr_id]);
		} else {
			setUnknownXML((prev) => [...prev, xmlDoc]);
			setHasUnknown(true);
			setUnknownList((prev) => [...prev, eidr_id]);
		}
	};

	const makeQuery = (eidrId) => {
		let requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		//let query = `https://cors-anywhere.herokuapp.com/https://proxy.eidr.org/resolve/${inputs.eidr_id}?type=Full&followAlias=false`;
		let query = "";
		query = `${API_URL}/api/resolve/${selectedOption}`;
		requestOptions = {
			...requestOptions,
			body: JSON.stringify({ eidr_id: eidrId }),
		};
		callAPI(query, requestOptions, eidrId).catch((error) => {
			console.error("Error right here ", eidrId, ": ", error);
			setEidrErrorList((prev) => [...prev, eidrId]);
		});
	};
	const reset = () => {
		setInputs({
			title: "",
			eidr_id: "",
		});
	};

	return (
		<div className='min-h-screen w-full md:w-4/5 lg:w-4/4 xl:w-2/3 bg-gradient-to-r from-gray-400 to-green-700 py-6 flex flex-col justify-center sm:py-12 mx-auto flex items-center'>
			<h1 className='text-4xl font-bold text-center mb-4'>
				BMR Template Generator
			</h1>
			<div>
				<button
					onClick={handleFormChange}
					className='text-white bg-black rounded-lg shadow-lg p-2 mt-4 transition duration-500 mr-2'
				>
					{isForm ? "Switch to File Mode" : "Switch to Text Mode"}
				</button>
				<select
					value={selectedOption}
					onChange={handleOptionChange}
					className='text-black bg-white rounded-lg shadow-lg p-2 mt-4 transition duration-500'
				>
					<option value='' disabled>
						Select an environment
					</option>
					<option value='sandbox1'>Sandbox1</option>
					<option value='production'>Production</option>
					<option value='sandbox2'>Sandbox2</option>
				</select>
			</div>
			{selectedOption === "production" && (
				<div className='mt-2'>
					<FontAwesomeIcon icon={faWarning} className='text-yellow-500 ml-2' />
					<span className='text-yellow-500'>
						You have chosen production, use with caution!
					</span>
				</div>
			)}
			<div className='flex'>
				{isForm ? (
					<GenerateFormInput
						inputs={inputs}
						handleChange={(e) =>
							setInputs((prevState) => ({
								...prevState,
								[e.target.name]: e.target.value.trim(),
							}))
						}
						setSearchType={setSearchType}
						makeQuery={makeQuery}
						onLoading={handleLoading}
					/>
				) : (
					<GenerateFileInput
						setSearchType={setSearchType}
						makeQuery={makeQuery}
						onLoading={handleLoading}
					/>
				)}
			</div>

			{!loading && <GeneratedTable dataConfig={dataConfig} />}
			{loading && <LoadingModal modalIsOpen={loading} />}
			<br></br>
		</div>
	);
};

export default App;
