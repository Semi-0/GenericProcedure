// SPDX-License-Identifier: GPL-3.0-or-later
//
// Copyright (c) 2009–2015 Gerald Jay Sussman and Chris Hanson
// Copyright (c) 2024–2026 semi-0
//
// This file was ported from the SDF system (Software Design for Flexibility).

import { GenericProcedureMetadata } from "./GenericProcedureMetadata";

export type GenericProcedureStore = Map<(...args: any) => any, GenericProcedureMetadata>
const default_store =  new Map<(...args: any) => any, GenericProcedureMetadata>()
var stores = default_store

export function has_metaData(procedure: (...args: any) => any): boolean{
    return stores.has(procedure)
} 

export function summarize_metadatas(): string[]{
    return [...stores.values()].map(metaData => metaData.name + " " + metaData.arity)
}


export function set_metaData(procedure: (...args: any) => any, metaData: GenericProcedureMetadata){
    stores.set(procedure, metaData)
}

export function get_metaData(procedure: (...args: any) => any): GenericProcedureMetadata | undefined{
    return stores.get(procedure)
}



export function construct_store(): GenericProcedureStore{
    return new Map<(...args: any) => any, GenericProcedureMetadata>()
}

export function get_default_store(): GenericProcedureStore{
    return stores
}

export function set_store(store: GenericProcedureStore){
    stores = store
}