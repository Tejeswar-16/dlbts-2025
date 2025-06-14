export default function Logistics(props){
    return (
        <>
            <div className="mx-auto rounded-xl shadow-xl bg-white w-75 lg:w-60 lg:h-60 mt-10">
                <h1 className="font-sans flex justify-center font-bold text-xl p-2">{props.heading}</h1>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-col">
                        <div className="flex flex-col justify-center w-25 bg-yellow-200 ml-5 lg:ml-4 mb-2 rounded-xl p-2">
                            <h1 className="font-sans font-semibold mx-auto text-lg">Male</h1>
                            <h1 className="font-sans font-bold mx-auto text-3xl">{props.maleCount}</h1>
                        </div>
                        <div className="flex flex-col justify-center bg-yellow-200 ml-5 lg:ml-4 mb-2 rounded-xl p-2">
                            <h1 className="font-sans font-semibold mx-auto text-lg">Female</h1>
                            <h1 className="font-sans font-bold mx-auto text-3xl">{props.femaleCount}</h1>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center w-35 bg-green-200 ml-2 mr-5 lg:mr-8 mb-2 rounded-xl p-2">
                        <h1 className="font-sans mx-auto font-semibold text-lg">Total</h1>
                        <h1 className="font-sans mx-auto font-semibold text-lg">Students</h1>
                        <h1 className="font-sans mx-auto font-bold mt-3 text-3xl">{props.totalCount}</h1>
                    </div>
                </div>
            </div>
        </>
    );
}