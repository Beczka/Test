export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {

    if (action.service === "BlurayPackage" && previouslySelectedServices.indexOf("VideoRecording") === -1) {
        return previouslySelectedServices;
    }

    if (action.type === "Deselect"
        && (action.service === "Photography" || action.service === "VideoRecording")
        && previouslySelectedServices.indexOf("TwoDayEvent") !== -1) {

        if (previouslySelectedServices.includes("Photography") && previouslySelectedServices.includes("VideoRecording")) {
            return previouslySelectedServices.filter(x => x != action.service);
        }

        if (previouslySelectedServices.includes("Photography") && !previouslySelectedServices.includes("VideoRecording")) {
            return previouslySelectedServices.filter(x => x != "Photography" && x != "TwoDayEvent");
        }

        if (previouslySelectedServices.includes("VideoRecording") && !previouslySelectedServices.includes("Photography")) {
            return previouslySelectedServices.filter(x => x != "VideoRecording" && x != "TwoDayEvent");
        }

        return previouslySelectedServices;
    }

    if (action.type === "Select") {
        if (previouslySelectedServices.indexOf(action.service) === -1) previouslySelectedServices.push(action.service);
        return previouslySelectedServices;
    }

    return previouslySelectedServices.filter(x => x != action.service);
};

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {

    var finalPrice = 0;
    var servicesPrices = selectedServices.map(name => new ServicePrice(name, false));

    if (servicesPrices.length == 0) {
        return ({ basePrice: 0, finalPrice: 0 })
    }

    finalPrice += applyPackageDiscount(servicesPrices, selectedYear)

    servicesPrices.filter(x => !x.discountApplied).forEach(element => {
        var price = basePrices(element.serviceType, selectedYear)
        finalPrice += applyIndividualServiceDiscount(element, servicesPrices, selectedYear, price)
    });

    return ({ basePrice: finalPrice, finalPrice: finalPrice })
};


export const basePrices = (selectedService: ServiceType, selectedYear: ServiceYear) => {
    switch (selectedService) {
        case "WeddingSession":
            return 600
        case "VideoRecording": case "Photography":
            if (selectedYear === 2020) return 1700
            if (selectedYear === 2021) return 1800
            if (selectedYear === 2022) return 1900
        default:
            return 0
    }
}

export const applyIndividualServiceDiscount = (selectedService: ServicePrice, allServices: ServicePrice[], selectedYear: ServiceYear, price : number) => {

    if (selectedService.discountApplied) {
        return price;
    }

    var photographys = allServices.filter(x => x.serviceType === "Photography");
    var videoRecordings = allServices.filter(x => x.serviceType === "VideoRecording");

    //wedding session costs regularly $600, but in a package with photography during the wedding or with a video recording it costs $300
    if (selectedService.serviceType == "WeddingSession" && (photographys.length > 0 || videoRecordings.length > 0)) {
        selectedService.discountApplied = true;
        price = 300;
    }

    //wedding session is free if the client chooses Photography during the wedding in 2022
    if (selectedService.serviceType == "WeddingSession" && photographys.length > 0 && selectedYear === 2022) {
        selectedService.discountApplied = true;
        price = 0;
    }

    return price;
}

export const applyPackageDiscount = (allServices: ServicePrice[], selectedYear: ServiceYear) => {

    var photographys = allServices.filter(x => x.serviceType === "Photography");
    var videoRecordings = allServices.filter(x => x.serviceType === "VideoRecording");

    //package of photography + video costs less: $2200 in 2020, $2300 in 2021 and $2500 in 2022,
    if (photographys.length > 0 && videoRecordings.length > 0 && selectedYear === 2020) {
        photographys.map(x => { x.discountApplied = true})
        videoRecordings.map(x => { x.discountApplied = true})
        return 2200;
    }

    if (photographys.length > 0 && videoRecordings.length > 0 && selectedYear === 2021) {
        photographys.map(x => { x.discountApplied = true})
        videoRecordings.map(x => { x.discountApplied = true})
        return 2300;
    }

    if (photographys.length > 0 && videoRecordings.length > 0 && selectedYear === 2022) {
        photographys.map(x => { x.discountApplied = true })
        videoRecordings.map(x => { x.discountApplied = true})
        return 2500;
    }

    return 0;
}

export class ServicePrice {
    serviceType: ServiceType;
    discountApplied: boolean;

    constructor(serviceType: ServiceType, discountApplied: boolean) {
        this.serviceType = serviceType;
        this.discountApplied = discountApplied;
    }
}