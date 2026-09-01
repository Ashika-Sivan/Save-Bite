import { PipelineStage, Types } from "mongoose";
import { IHotelCreateData } from "../../dtos/hotel.dto";
import { IHotel } from "../../interfaces/models/IHotel.model";
import { IHotelRepository, ILiveHotelMenuQuery, ILiveHotelMenuRepositoryResult, ILiveHotelPaginatedResult, ILiveHotelQuery, ILiveHotelRepositoryResult } from "../../interfaces/repository/IHotelRepository";
import { Hotel } from "../../models/vendor/hotel.model";
import { BaseRepository } from "../base.repository";

export class HotelRepository extends BaseRepository<IHotel> implements IHotelRepository{
    constructor(){
        super(Hotel);
    }

    async createHotel(data: IHotelCreateData): Promise<IHotel> {
            return await Hotel.create(data);
    }

    async findByVendorId(vendorId: string): Promise<IHotel[]> {
        return await Hotel.find({vendorId}).sort({
            createdAt:-1,
        });
    }
   async findByIdAndVendorId(hotelId: string, vendorId: string): Promise<IHotel | null> {
       return await Hotel.findOne({
        _id:hotelId,
        vendorId,
       })
   }
   async findLiveHotels(
    query: ILiveHotelQuery
): Promise<ILiveHotelPaginatedResult> {
    const {
        startOfDay,
        endOfDay,
        cutOffThreshold,
        latitude,
        longitude,
        skip,
        limit,
        search,
    } = query;

    const hasLocation =
        latitude !== undefined &&
        longitude !== undefined;

    const pipeline: PipelineStage[] = [];
   

    
   
    if (hasLocation) {
        pipeline.push({
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [
                        longitude,
                        latitude,
                    ],
                },
                distanceField: "distanceInMeters",
                spherical: true,
                query: {
                    isActive: true,
                },
            },
        });
    } else {
        pipeline.push({
            $match: {
                isActive: true,
            },
        });
    }


    pipeline.push({
        $lookup: {
            from: "dailymenus",
            let: {
                currentHotelId: "$_id",
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: [
                                        "$hotelId",
                                        "$$currentHotelId",
                                    ],
                                },
                                {
                                    $gte: [
                                        "$menuDate",
                                        startOfDay,
                                    ],
                                },
                                {
                                    $lt: [
                                        "$menuDate",
                                        endOfDay,
                                    ],
                                },
                                {
                                    $eq: [
                                        "$isLive",
                                        true,
                                    ],
                                },
                                {
                                    $gt: [
                                        "$pickupWindow.endTime",
                                        cutOffThreshold,
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    $match: {
                        items: {
                            $elemMatch: {
                                isAvailable: true,
                                stockQuantity: {
                                    $gt: 0,
                                },
                            },
                        },
                    },
                },
                {
                    $addFields: {
                        availableItemCount: {
                            $size: {
                                $filter: {
                                    input: "$items",
                                    as: "item",
                                    cond: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$$item.isAvailable",
                                                    true,
                                                ],
                                            },
                                            {
                                                $gt: [
                                                    "$$item.stockQuantity",
                                                    0,
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        pickupWindow: 1,
                        availableItemCount: 1,
                        items: 1,
                    },
                },
                {
                    $limit: 1,
                },
            ],
            as: "liveMenu",
        },
    });

    /*
     * Remove hotels that do not have a valid live menu.
     */
    pipeline.push({
        $unwind: "$liveMenu",
    });

    if (search) {
        const regexSearch = { $regex: search, $options: "i" };
        pipeline.push({
            $match: {
                $or: [
                    { hotelName: regexSearch },
                    { businessType: regexSearch },
                    { place: regexSearch },
                    { address: regexSearch },
                    { "liveMenu.items.itemName": regexSearch }
                ]
            }
        });
    }

    if (!hasLocation) {
        pipeline.push({
            $sort: {
                createdAt: -1,
            },
        });
    }

    
    pipeline.push({
        $facet: {
            hotels: [
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
                {
                    $project: {
                        _id: 0,
                        hotelId: "$_id",
                        vendorId: 1,
                        menuId: "$liveMenu._id",
                        hotelName: 1,
                        businessType: 1,
                        hotelImageKey: 1,
                        place: 1,
                        address: 1,
                        location: 1,
                        pickupWindow:
                            "$liveMenu.pickupWindow",
                        availableItemCount:
                            "$liveMenu.availableItemCount",
                        distanceInMeters: 1,
                    },
                },
            ],
            totalCount: [
                {
                    $count: "count",
                },
            ],
        },
    });

    const [result] = await Hotel.aggregate<{
        hotels: ILiveHotelRepositoryResult[];
        totalCount: Array<{
            count: number;
        }>;
    }>(pipeline);

    return {
        hotels: result?.hotels ?? [],
        total: result?.totalCount[0]?.count ?? 0,
    };
}

async findLiveHotelMenu(
    query: ILiveHotelMenuQuery
): Promise<ILiveHotelMenuRepositoryResult | null> {
    const {
        hotelId,
        startOfDay,
        endOfDay,
        cutoffThreshold,
    } = query;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                _id: new Types.ObjectId(hotelId),
                isActive: true,
            },
        },
        {
            $lookup: {
                from: "dailymenus",
                let: {
                    currentHotelId: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: [
                                            "$hotelId",
                                            "$$currentHotelId",
                                        ],
                                    },
                                    {
                                        $gte: [
                                            "$menuDate",
                                            startOfDay,
                                        ],
                                    },
                                    {
                                        $lt: [
                                            "$menuDate",
                                            endOfDay,
                                        ],
                                    },
                                    {
                                        $eq: [
                                            "$isLive",
                                            true,
                                        ],
                                    },
                                    {
                                        $gt: [
                                            "$pickupWindow.endTime",
                                            cutoffThreshold,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            pickupWindow: 1,

                            items: {
                                $filter: {
                                    input: "$items",
                                    as: "item",
                                    cond: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$$item.isAvailable",
                                                    true,
                                                ],
                                            },
                                            {
                                                $gt: [
                                                    "$$item.stockQuantity",
                                                    0,
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                    {
                        $match: {
                            "items.0": {
                                $exists: true,
                            },
                        },
                    },
                    {
                        $limit: 1,
                    },
                ],
                as: "liveMenu",
            },
        },
        {
            $unwind: "$liveMenu",
        },
        {
            $project: {
                _id: 0,

                hotelId: "$_id",
                menuId: "$liveMenu._id",

                hotelName: 1,
                businessType: 1,
                hotelImageKey: 1,
                place: 1,
                address: 1,

                pickupWindow:
                    "$liveMenu.pickupWindow",

                items: {
                    $map: {
                        input: "$liveMenu.items",
                        as: "item",
                        in: {
                            itemId: "$$item._id",
                            itemName: "$$item.itemName",
                            itemImageKey:"$$item.itemImageKey",
                            unitType: "$$item.unitType",
                            originalPrice:
                                "$$item.originalPrice",
                            discountedPrice:
                                "$$item.discountedPrice",
                            stockQuantity:
                                "$$item.stockQuantity",
                            isAvailable:
                                "$$item.isAvailable",
                        },
                    },
                },
            },
        },
    ];

    const [result] =
        await Hotel.aggregate<ILiveHotelMenuRepositoryResult>(
            pipeline
        );

    return result ?? null;
}


}