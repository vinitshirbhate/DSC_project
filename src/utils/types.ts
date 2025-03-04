export type MapData = {
    data : {
        token : string,
        meta : any | null,
    },
    expiry : number | null;
}

export type UserMapData = {
    id : string,
    name? : string,
    email : string,
    refreshToken : string | null,
    expiry : number
}

export type signData = {
    id : string,
    email : string,
    exp : number
}