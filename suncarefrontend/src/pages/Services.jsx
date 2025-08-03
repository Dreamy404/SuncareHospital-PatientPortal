import React, { useEffect, useState } from "react";
import {
    Navbar,
    Footer
}from '../component';

const Services=()=>{
    const [services,setServices]=useState([]);

    useEffect(()=>{
      const getServices=async ()=>{
        try {
            const response=await fetch('/suncarehospital/options/services',{
                method:"GET"
            });

            const data=await response.json();

            setServices(data);
        } catch (error) {
            console.log(error);
        }
      }

      getServices();
    },[]);
    return (
        <>
        <Navbar/>
           <main className="service-page">
            <h2>Our Services</h2>
            <div className="service-container">
              <ul className="services">
                {services.map(service=>(<Service  key={service.id} id={service.id} name={service.name} price={service.price}/>))}
              </ul>
            </div>
           </main>
        <Footer/>
        </>
    );
}

const Service=({id,name,price})=>{
    return (
        <>
          <li className="service-item">
             <div className="service-name">{name}</div>
             <div className="service-price">৳ {price}</div>
          </li>
        </>
    )
}


export default Services;