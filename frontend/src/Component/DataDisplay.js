import React, { useEffect, useState } from 'react'

const DataDisplay = () => {
    const [Data, setData] = useState([])
    const getData = async () => {
        try {
            let response = await fetch("http://192.168.1.19:8000/", { //https://webhook-repo-t1e2.onrender.com"//m
                method: "GET",
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            let data = await response.json();
            console.log(data);
            setData(data);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }
    useEffect(() => {
        getData();
        const intervalId = setInterval(() => {
            // setData([]);
            getData();
        }, 15000);
    }, [])

    return (

        <div className="container  text-center ">
            {Data.length > 0 ?
                (
                    Data.reverse().map((e,i) => (
                        e.action === 'push' ?
                            <div key={i} className="row border mt-4 text-white" style={{ backgroundColor: '#4B7197' }}>
                                {e.author} pushed to {e.to_branch} on {e.timestamp}
                            </div>
                            :
                            (
                                e.action === 'pull_request' ? <div key={i} className="row border mt-4 text-white" style={{ backgroundColor: '#4B7197' }}>
                                    {e.author} submitted a pull request from {e.from_branch} to {e.to_branch} on {e.timestamp}
                                </div>
                                    :
                                    (
                                        e.action === 'merge' ? <div key={i} className="row border mt-4 text-white" style={{ backgroundColor: '#4B7197' }}>
                                            {e.author} merged branch {e.from_branch} to {e.to_branch} on {e.timestamp}
                                        </div> : <></>
                                    )

                            )
                    )
                    ))
                :
                (<div className="row border mt-4 text-white" style={{ backgroundColor: '#4B7197' }}>
                    No Data Found
                </div>)
            }



        </div >
    )
}

export default DataDisplay
