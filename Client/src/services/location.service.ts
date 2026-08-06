export interface LocationSearchResult{
    place_id:number;
    display_name:string;
    lat:string;
    lon:string;

    address:{
        road?:string;
        suburb?:string;
        neighbourhood?:string;
        city?:string;
        town?:string;
        village?:string;
        muncipality?:string;
        country?:string;
        state?:string;
        postcode?:string;

    }
}

const NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org";
export const searchLocations=async(query:string):Promise<LocationSearchResult[]>=>{
    const params=new URLSearchParams({
        q:query,
        format:'jsonv2',//json to return v2 format
        addressdetails:'1',//enabled
        limit:"5",//Nominatim to return at most five results.
        countryCode:'in'//this limit search to india

    })

    const response=await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`,
        {
            headers:{
            Accept:"application/json",
            "Accept-Language":"en"
            },
        }
    );

    if(!response.ok){
        throw new Error("Location search failed")
    }
    return await response.json() as LocationSearchResult[];
};

export const reverseGeoCode=async(latitude:number,longitude:number):Promise<LocationSearchResult>=>{
    const params=new URLSearchParams({
        lat:latitude.toString(),
        lon:longitude.toString(),
        format:"jsonv2",
        addressDetails:"1",
        zoom:'18'
    })
    const response=await fetch(`${NOMINATIM_BASE_URL}/reverse?${params.toString()}`,
        {
                headers:{
                    Accept:"application/json",
                    "Accept-Language":"en",
                }
        }
    );

    if(!response.ok){
        throw new Error("unable to find the selected address")
    }
    return await response.json() as LocationSearchResult
}
