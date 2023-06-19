import React, { useEffect, useRef, useState } from 'react';
import './Table.css'
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net-dt/js/dataTables.dataTables';
import $ from 'jquery';
import LoaderModulos from '../LoaderModulos/loaderModulos';

const Table = ({ Datos, children }) => {
    const tableRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (Datos.length > 0) {
            setLoading(false);
        }
    }, [Datos]);

    useEffect(() => {
        if (!loading) {
            if ($.fn.DataTable.isDataTable(tableRef.current)) {
                $(tableRef.current).DataTable().destroy();
            }

            $(tableRef.current).DataTable({
                language: {
                    emptyTable: "No hay datos disponibles en la tabla",
                    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    infoEmpty: "Mostrando 0 de 0 registros",
                    infoFiltered: "(filtrado de _MAX_ registros en total)",
                    infoPostFix: "",
                    infoThousands: ",",
                    lengthMenu: "Mostrar _MENU_ registros por página",
                    loadingRecords: "Cargando...",
                    processing: "Procesando...",
                    search: "Buscar:",
                    zeroRecords: "No se encontraron registros coincidentes",
                    paginate: {
                        first: "Primero",
                        last: "Último",
                        next: "Siguiente",
                        previous: "Anterior",
                    },
                    aria: {
                        sortAscending: ": Activar para ordenar la columna de forma ascendente",
                        sortDescending: ": Activar para ordenar la columna de forma descendente",
                    },
                },
            });
        }
    }, [loading]);

    return (
        <>
            {loading ?
                <LoaderModulos />
                :
                <div className='table-responsive'>
                    <table className="table table-hover display compact" ref={tableRef}>
                        {children}
                    </table>
                </div>
            }
        </>
    );
}

export default Table;
